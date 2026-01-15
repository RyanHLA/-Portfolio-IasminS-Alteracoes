import { Instagram, Twitter, Mail, ArrowRight } from "lucide-react";
import imgSobreMim from "@/assets/imgSobreMim.jpg";

const About = () => {
  const HeaderContent = () => (
    <div className="space-y-4">
      <span className="text-accent uppercase tracking-[0.2em] text-xs font-bold">
        Quem Sou Eu
      </span>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-tight text-gray-900">
        Capturando a alma <br />
        <span className="italic text-gray-500">do momento.</span>
      </h1>
    </div>
  );

  return (
    // ALTERAÇÃO AQUI: Mudei de 'bg-stone-50' para 'bg-stone-100'
    <section className="w-full py-12 px-4 md:px-8 relative overflow-hidden bg-stone-100" id="sobre">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');
        
        :root {
          --gold: 45 70% 50%;
        }
        
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .font-sans {
          font-family: 'Montserrat', sans-serif;
        }
        
        .text-accent {
            color: #8c7b75;
        }
        
        .image-container {
            position: relative;
            overflow: hidden;
        }
        
        .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.1);
            transition: background 0.3s ease;
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* --- HEADER MOBILE --- */}
          <div className="md:hidden col-span-1 mb-4">
            <HeaderContent />
          </div>

          {/* Coluna da Imagem */}
          <div className="md:col-span-5 relative group">
            <div className="relative z-10">
              <img
                src={imgSobreMim}
                alt="Retrato da Fotógrafa"
                className="w-full h-[500px] md:h-[600px] object-cover shadow-2xl rounded-sm transition duration-700 ease-in-out"
              />
              {/* Legenda Flutuante */}
              <div className="absolute -bottom-6 -right-6 bg-white py-3 px-6 shadow-xl hidden md:block">
                <p className="font-serif italic text-xl text-gray-600">
                  "A luz conta a história."
                </p>
              </div>
            </div>

            {/* Elemento Decorativo Atrás */}
            <div className="absolute -top-4 -left-4 w-full h-full border border-gray-300 z-0"></div>
          </div>

          {/* Coluna de Texto */}
          <div className="md:col-span-7 space-y-8 md:pl-8">
            
            {/* --- HEADER DESKTOP --- */}
            <div className="hidden md:block">
               <HeaderContent />
            </div>

            {/* Texto da Bio */}
            <div className="space-y-6 text-gray-600 leading-relaxed max-w-xl">
              <p>
                Olá, meu nome é <strong className="text-gray-900">Iasmin Santos</strong>. Sou uma fotógrafa apaixonada por luz natural e expressões genuínas.
              </p>
              <p>
                Minha jornada começou há 8 anos, quando peguei uma câmera analógica antiga do meu avô. O que começou como curiosidade se transformou em uma obsessão por congelar o tempo. Não busco apenas a foto perfeita tecnicamente, mas aquela que faz você sentir o cheiro da chuva ou o calor de um abraço ao revê-la anos depois.
              </p>
              <p>
                Especializei-me em retratos intimistas e editoriais de moda, sempre buscando a beleza na imperfeição e no espontâneo.
              </p>
            </div>

            {/* Redes Sociais e Botão */}
            <div className="pt-6 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition duration-300"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition duration-300"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              {/* Botão */}
              <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 group">
                <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#f5f5f4_0%,hsl(var(--gold))_50%,#f5f5f4_100%)]"></span>
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-3xl">
                  <span className="flex items-center gap-2">
                    Vamos conversar <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;