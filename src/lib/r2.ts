import { supabase } from "@/integrations/supabase/client";

export const r2Storage = {
  upload: async (file: File, folder: string = 'gallery'): Promise<string | null> => {
    try {
      // Sanitização básica do nome do arquivo
      const fileExt = file.name.split('.').pop();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `${folder}/${Date.now()}-${cleanFileName}.${fileExt}`;

      console.log("Solicitando URL de upload para:", fileName);

      // 1. Invoca a Edge Function para obter a URL assinada
      const { data, error: functionError } = await supabase.functions.invoke('upload-url2', {
        body: { 
          action: 'upload', 
          fileName, 
          fileType: file.type 
        }
      });

      if (functionError) {
        console.error("Erro na Edge Function:", functionError);
        throw functionError;
      }

      if (!data?.url) {
        throw new Error("URL de upload não retornada pela função.");
      }

      // 2. Faz o upload do arquivo binário diretamente para o R2 usando a URL
      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`Falha no upload para o R2: ${uploadResponse.statusText}`);
      }

      // Retorna a URL pública final para visualização
      // Certifique-se que VITE_R2_PUBLIC_URL está definido no .env ou substitua pela string direta
      const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
      return `${publicUrl}/${fileName}`;

    } catch (error) {
      console.error("Erro no processo de upload:", error);
      // Opcional: Mostrar toast de erro aqui se tiver acesso à biblioteca de UI
      return null;
    }
  },

  delete: async (fileName: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('upload-url2', {
        body: { 
          action: 'delete', 
          fileName 
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }
  }
};