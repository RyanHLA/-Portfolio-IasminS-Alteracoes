import React, { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Tipagem para os depoimentos
interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
}

// Dados de exemplo iniciais (Fallback e estrutura padrão)
const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana & Carlos",
    role: "Casamento ao Pôr do Sol",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    content: "As fotos ficaram simplesmente mágicas! O fotógrafo conseguiu capturar a emoção de cada momento sem ser intrusivo. Reviver nosso dia através dessas imagens é o melhor presente que poderíamos ter."
  },
  {
    id: 2,
    name: "Mariana Costa",
    role: "Ensaio Profissional",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    content: "Precisava de fotos para meu LinkedIn e site pessoal. O resultado superou todas as expectativas. A direção durante o ensaio me deixou super à vontade."
  },
  {
    id: 3,
    name: "Sabor & Arte",
    role: "Fotografia Gastronômica",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    content: "As fotos dos nossos pratos aumentaram significativamente nosso engajamento nas redes sociais. A atenção aos detalhes de iluminação e composição é impecável."
  },
  {
    id: 4,
    name: "Família Oliveira",
    role: "Ensaio de Gestante",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    content: "Foi uma tarde divertida e leve. As crianças adoraram e as fotos ficaram espontâneas e cheias de vida, exatamente como queríamos."
  },
  {
    id: 5,
    name: "Pedro Santos",
    role: "Evento Corporativo",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    content: "Excelente trabalho! Entregou as fotos editadas com uma rapidez impressionante e a qualidade estava altíssima. Com certeza fecharemos mais parcerias."
  }
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  // Opcional: Buscar depoimentos reais do banco de dados (se houver tabela 'testimonials')
  // Mantendo comentado para priorizar o layout solicitado com dados de exemplo
  /*
  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase.from('testimonials').select('*');
      if (data && data.length > 0) {
          // Mapear dados do DB para o formato Testimonial se necessário
      }
    };
    fetchTestimonials();
  }, []);
  */

  // Duplicamos a lista para garantir que o loop seja contínuo sem buracos
  // Multiplicamos por 4 para garantir volume suficiente para a animação em telas largas
  const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section id="depoimentos" className="bg-stone-50 py-24 overflow-hidden font-sans text-slate-800 relative">
      
      {/* Estilos inline para animação customizada e fontes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite; /* Aumentei o tempo para 60s para ficar mais suave com mais itens */
        }
        /* Pausa a animação ao passar o mouse */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Degradê lateral para suavizar a entrada e saída dos cards */}
      <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto mb-12 px-4 text-center">
        <h2 className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-3 font-sans">
          Depoimentos
        </h2>
        <h3 className="text-3xl md:text-4xl font-serif font-medium text-stone-900">
          O que dizem nossos clientes
        </h3>
        <div className="w-12 h-0.5 bg-stone-400 mx-auto mt-6"></div>
      </div>

      {/* Container de Rolagem Infinita */}
      <div className="flex w-full overflow-hidden">
        <div className="flex animate-scroll w-max gap-6 px-3">
          
          {infiniteTestimonials.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`} 
              className="w-[300px] md:w-[400px] flex-shrink-0 bg-white p-8 rounded-none md:rounded-lg border-l-4 border-stone-200 hover:border-stone-800 shadow-sm transition-colors duration-300 group cursor-default"
            >
              <div className="flex flex-col h-full">
                
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm md:text-base font-sans">
                        {testimonial.name}
                      </h4>
                      <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold font-sans">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <Quote size={24} className="text-stone-200 group-hover:text-stone-800 transition-colors duration-300" />
                </div>

                {/* Texto */}
                <p className="text-stone-600 text-sm leading-relaxed italic font-sans">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Testimonials;