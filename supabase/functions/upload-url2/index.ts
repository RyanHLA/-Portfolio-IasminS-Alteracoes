import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.450.0"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.450.0"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 1. Defina a lista de tipos permitidos (Whitelist)
// <--- NOVO: Lista de segurança
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  //'image/gif',
  //'image/svg+xml' // Opcional: Adicione apenas se você permitir SVG
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Usuário não autenticado ou token inválido')
    }

    const { action, fileName, fileType } = await req.json()

    // 2. Validação de Segurança ANTES de conectar ao R2
    if (action === 'upload') {
        // <--- NOVO: Validação Rigorosa
        if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType)) {
            console.error(`[SEGURANÇA] Tentativa de upload de tipo inválido: ${fileType} por ${user.email}`);
            throw new Error(`Tipo de arquivo não permitido (${fileType}). Apenas imagens são aceitas.`);
        }
    }

    // Configuração R2
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
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})