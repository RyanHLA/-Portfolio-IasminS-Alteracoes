import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Fallback images
import casamentoImg from "@/assets/casamento.jpg";
import gestanteImg from "@/assets/gestante.jpg";
import quinzeImg from "@/assets/15anos.jpg";
import preweddingImg from "@/assets/prewedding.jpg";
import externoImg from "@/assets/externo.jpg";
import eventosImg from "@/assets/eventos.jpg";

interface Category {
  id: string;
  title: string;
  image: string;
  description: string;
}

const defaultCategories: Category[] = [
  {
    id: "casamentos",
    title: "Casamentos",
    image: casamentoImg,
    description: "O grande dia eternizado",
  },
  {
    id: "gestantes",
    title: "Gestantes",
    image: gestanteImg,
    description: "A espera mais doce",
  },
  {
    id: "15-anos",
    title: "15 Anos",
    image: quinzeImg,
    description: "Celebrando a transição",
  },
  {
    id: "pre-wedding",
    title: "Pré-Wedding",
    image: preweddingImg,
    description: "O amor do casal",
  },
  {
    id: "externo",
    title: "Externo",
    image: externoImg,
    description: "Retratos ao ar livre",
  },
  {
    id: "eventos",
    title: "Eventos",
    image: eventosImg,
    description: "Momentos especiais",
  },
];

const Gallery = () => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const { data } = await supabase
        .from("site_images")
        .select("*")
        .eq("section", "gallery")
        .order("display_order");

      if (data && data.length > 0) {
        const categoryMap = new Map<string, { image: string }>();

        data.forEach((img) => {
          if (img.category && !categoryMap.has(img.category)) {
            categoryMap.set(img.category, { image: img.image_url });
          }
        });

        const updatedCategories = defaultCategories.map((cat) => {
          const dbImage = categoryMap.get(cat.id);
          if (dbImage) {
            return { ...cat, image: dbImage.image };
          }
          return cat;
        });

        setCategories(updatedCategories);
      }
    };

    fetchGalleryImages();
  }, []);

  return (
    <div className="section-padding bg-background pb-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        
        .custom-font-wrapper {
            font-family: 'Montserrat', sans-serif;
            color: #333;
        }
        
        .serif-font {
            font-family: 'Cormorant Garamond', serif;
        }

        /* Hover Overlay Animation */
        .portfolio-item:hover .overlay {
            opacity: 1;
            transform: translateY(0);
        }
        
        .portfolio-item .overlay {
            transition: all 0.4s ease-in-out;
            transform: translateY(10px);
        }

        .portfolio-item img {
            transition: transform 0.6s ease-in-out;
        }
      `}</style>

      {/* Cabeçalho da Seção (Agora totalmente à esquerda) */}
      {/* REMOVIDO: mx-auto e max-w-7xl para tirar a centralização */}
      <div className="w-full px-6 custom-font-wrapper mb-16 text-left">
        <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl lg:text-5xl">
          Trabalhos
        </h2>
        <div className="mt-6 h-[1px] w-16 bg-gold/50" />
        <p className="mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-muted-foreground">
          Explore as diferentes categorias e descubra como cada momento
          especial pode ser transformado em memória eterna
        </p>
      </div>

      {/* Grid de Cards (Largura Total) */}
      <div className="w-full custom-font-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
          {categories.map((category) => (
            <Link key={category.id} to={`/categoria/${category.id}`}>
              <article className="portfolio-item group relative overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 aspect-square">
                <img 
                  src={category.image} 
                  alt={`Fotografia de ${category.title}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Content */}
                <div className="overlay absolute inset-0 bg-black/60 opacity-0 flex flex-col justify-center items-center text-center p-6 z-10">
                  <h3 className="text-2xl text-white font-medium mb-4 serif-font italic">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-200 mb-6 font-light">
                    {category.description}
                  </p>
                  
                  <button className="border border-white text-white px-8 py-2 text-xs font-bold tracking-widest hover:bg-white hover:text-black transition-colors duration-300 uppercase">
                    Ver Ensaio
                  </button>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;