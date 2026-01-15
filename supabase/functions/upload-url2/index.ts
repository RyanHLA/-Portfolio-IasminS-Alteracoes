import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.450.0"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.450.0"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CONFIGURAÇÕES DE SEGURANÇA
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Ajuste conforme sua necessidade)
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  //'image/gif',
  //'image/svg+xml'
];

serve(async (req) => {
  // Tratamento de CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    // 1. Setup do Cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Autenticação (Quem é?)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized: Usuário não autenticado.')
    }

    // 3. Autorização RBAC (É Admin?)
    // <--- SEGURANÇA CRÍTICA: Verifica na tabela user_roles
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
        console.error(`[ACESSO BLOQUEADO] Usuário ${user.email} tentou upload sem permissão de admin.`);
        throw new Error('Forbidden: Apenas administradores podem gerenciar arquivos.');
    }

    const { action, fileName, fileType, fileSize } = await req.json()

    // 4. Validações de Upload
    if (action === 'upload') {
        // Validação de Tipo
        if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType)) {
            throw new Error(`Tipo de arquivo não permitido (${fileType}).`);
        }

        // <--- NOVO: Validação de Tamanho
        // Nota: O navegador envia o tamanho em bytes.
        if (fileSize && fileSize > MAX_FILE_SIZE) {
            throw new Error(`Arquivo muito grande. Limite máximo é de ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        }
    }

    // 5. Configuração R2
    const s3 = new S3Client({
      region: "auto",
      endpoint: Deno.env.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
      },
    })
    
    const bucketName = Deno.env.get('R2_BUCKET_NAME');

    if (action === 'upload') {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
        // ContentLength: fileSize // Opcional: Se descomentar, o tamanho EXATO deve bater no upload, senão falha.
      })
      
      const url = await getSignedUrl(s3, command, { expiresIn: 60 })
      
      return new Response(JSON.stringify({ url }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (action === 'delete') {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      })
      await s3.send(command)
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error("Erro na Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})