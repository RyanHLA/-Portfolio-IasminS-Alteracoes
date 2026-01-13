import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Inicializa o cliente S3 (R2)
const r2Client = new S3Client({
  region: "auto",
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export const r2Storage = {
  // Função para Upload
  upload: async (file: File, folder: string = 'gallery'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      // Gera nome único
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Convertemos o File para ArrayBuffer e depois para Uint8Array
      // Isso impede que o AWS SDK tente usar streams incompatíveis
      const fileBuffer = await file.arrayBuffer();
      const fileBody = new Uint8Array(fileBuffer);

      const command = new PutObjectCommand({
        Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBody, // Enviamos o buffer, não o objeto File direto
        ContentType: file.type,
        ContentLength: file.size, // Boa prática informar o tamanho
      });

      await r2Client.send(command);

      // Retorna a URL pública
      return `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error("Erro no upload R2:", error);
      return null;
    }
  },

  // Função para Deletar
  delete: async (imageUrl: string) => {
    try {
      if (!imageUrl) return;

      const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
      const key = imageUrl.replace(`${publicUrl}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
        Key: key,
      });

      await r2Client.send(command);
    } catch (error) {
      console.error("Erro ao deletar do R2:", error);
    }
  }
};