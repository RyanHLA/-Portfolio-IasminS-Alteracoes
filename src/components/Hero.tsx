import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImageFallback from "@/assets/herocasamento.jpg"; 

const Hero = () => {
  const [images, setImages] = useState({
    desktop: heroImageFallback,
    mobile: heroImageFallback
  });

  useEffect(() => {
    const fetchHeroImages = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('section, image_url')
        .in('section', ['hero', 'hero_mobile']);

      if (data && data.length > 0) {
        const desktopImg = data.find(img => img.section === 'hero')?.image_url;
        const mobileImg = data.find(img => img.section === 'hero_mobile')?.image_url;

        setImages({
          desktop: desktopImg || heroImageFallback,
          mobile: mobileImg || desktopImg || heroImageFallback
        });
      }
    };

    fetchHeroImages();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById("contato");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      
      {/* Background Images */}
      <div className="absolute inset-0">
        <img
          src={images.mobile}
          alt="Fotografia Mobile"
          className="block md:hidden h-full w-full object-cover"
        />
        <img
          src={images.desktop}
          alt="Fotografia Desktop"
          className="hidden md:block h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-soft-black/30 via-soft-black/20 to-soft-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-24 text-left md:px-20 md:pb-32">
        
        <h1 className="animate-fade-in font-serif text-4xl font-light leading-tight text-primary-foreground md:text-5xl lg:text-6xl xl:text-7xl">
          Iasmin Santos
        </h1>

        <p className="mt-4 animate-fade-in font-sans text-lg font-light text-white/90 md:text-xl [animation-delay:100ms]">
          Eternizando momentos únicos com sensibilidade
        </p>
        
        {/* --- BOTÃO NOVO (GLASSMORPHISM) --- */}
        <button 
          onClick={scrollToContact}
          className="
            group
            relative
            flex
            items-center
            justify-center
            bg-white/10 hover:bg-white/20
            backdrop-blur-sm
            border border-white/30
            text-white font-bold font-sans /* font-sans adicionada para preservar sua fonte */
            py-2 px-6
            rounded-none
            shadow-lg hover:shadow-xl hover:shadow-white/10
            transition-all duration-300 ease-in-out
            transform hover:-translate-y-1 active:translate-y-0 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-white/30
            mt-8 animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]
          "
        >
            <span className="drop-shadow-md">Solicitar Orçamento</span>
        </button>

      </div>
    </section>
  );
};

export default Hero;