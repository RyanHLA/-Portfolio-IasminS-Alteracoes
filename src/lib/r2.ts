import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export const r2Storage = {
  // Função para fazer Upload
  upload: async (file: File, folder: string = 'gallery'): Promise<string | null> => {
    try {
      // Cria um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: file.type,
        // ACL: 'public-read', // Descomente se precisar forçar, mas geralmente não precisa no R2
      });

      await r2Client.send(command);

      // Retorna a URL pública pronta para salvar no banco
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
      // Remove a parte da URL pública para pegar apenas o caminho do arquivo (Key)
      // Ex: remove "https://pub-xyz.r2.dev/" e deixa "gallery/foto.jpg"
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