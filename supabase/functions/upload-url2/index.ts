import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.450.0"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.450.0"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- CONFIGURAÇÕES GERAIS ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'image/gif',
  'image/svg+xml'
];

serve(async (req) => {
  // Tratamento de CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    // 1. Setup Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Autenticação (Quem é o usuário?)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized: Usuário não autenticado.')
    }

    // 3. Autorização (O usuário é Admin?)
    // Consulta a tabela user_roles para garantir que ele tem permissão
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
        console.error(`[ACESSO BLOQUEADO] Usuário ${user.email} tentou upload sem ser admin.`);
        throw new Error('Forbidden: Apenas administradores podem gerenciar arquivos.');
    }

    const { action, fileName, fileType, fileSize } = await req.json()

    // 4. Configuração R2 (S3 Compatible)
    const s3 = new S3Client({
      region: "auto",
      endpoint: Deno.env.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
      },
    })
    
    const bucketName = Deno.env.get('R2_BUCKET_NAME');

    // --- AÇÃO: UPLOAD ---
    if (action === 'upload') {
      // Validação de Tipo de Arquivo
      if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType)) {
          throw new Error(`Tipo de arquivo não permitido (${fileType}). Apenas imagens são aceitas.`);
      }

      // Validação de Tamanho (Lógica)
      if (fileSize && fileSize > MAX_FILE_SIZE) {
          throw new Error(`Arquivo muito grande. O limite máximo é ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      }

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
        // Cache: Define cache de 1 ano (31536000s) e immutable para performance máxima
        CacheControl: 'public, max-age=31536000, immutable', 
      })
      
      const url = await getSignedUrl(s3, command, { expiresIn: 60 })
      
      return new Response(JSON.stringify({ url }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // --- AÇÃO: DELETE ---
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