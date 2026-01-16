import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AlbumPhoto {
  id: string;
  image_url: string;
  display_order: number | null;
}

// CORREÇÃO 1: Removido 'description' da interface pois não existe na tabela albums
interface AlbumDetails {
  id: string;
  title: string;
  event_date: string | null;
}

const AlbumPhotos = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;

    const fetchAlbumData = async () => {
      setLoading(true);
      
      // 1. Buscar detalhes do álbum
      // CORREÇÃO 2: Removido 'description' do select
      const { data: albumData, error } = await supabase
        .from("albums")
        .select("id, title, event_date")
        .eq("id", albumId)
        .single();

      if (error) {
        console.error("Erro ao buscar álbum:", error);
      }

      if (albumData) {
        setAlbum(albumData);

        // 2. Buscar fotos do álbum na tabela correta (site_images)
        const { data: photosData } = await supabase
          .from("site_images") 
          .select("id, image_url, display_order")
          .eq("album_id", albumId)
          .order("display_order", { ascending: true });

        if (photosData) {
          setPhotos(photosData);
        }
      }
      
      setLoading(false);
    };

    fetchAlbumData();
  }, [albumId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Carregando fotos...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Álbum não encontrado.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
          
          .serif-font {
              font-family: 'Cormorant Garamond', serif;
          }
          .sans-font {
              font-family: 'Montserrat', sans-serif;
          }
        `}</style>

        <div className="section-padding">
          <div className="mx-auto max-w-7xl px-6">
            
            {/* Botão Voltar */}
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold sans-font"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para Álbuns
            </button>

            {/* Cabeçalho do Álbum */}
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="text-gold tracking-[0.2em] text-xs uppercase font-semibold mb-3 block">
                {album.event_date ? formatDate(album.event_date) : "Portfólio"}
              </span>
              <h1 className="serif-font text-4xl md:text-5xl lg:text-6xl text-foreground font-normal mb-6">
                {album.title}
              </h1>
              {/* CORREÇÃO 3: Removida a renderização da descrição que não existe */}
            </div>

            {/* LISTA DE FOTOS - Coluna única e formato real */}
            <div className="flex flex-col gap-8 md:gap-16 max-w-5xl mx-auto">
              {photos.map((photo) => (
                <div key={photo.id} className="w-full fade-in-up">
                  <img
                    src={photo.image_url}
                    alt={`Foto do álbum ${album.title}`}
                    className="w-full h-auto shadow-sm"
                    loading="lazy"
                  />
                </div>
              ))}

              {photos.length === 0 && (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground sans-font">Nenhuma foto encontrada neste álbum.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AlbumPhotos;