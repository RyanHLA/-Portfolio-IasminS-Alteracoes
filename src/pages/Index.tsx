import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
// Você pode remover o import do StickySection e useStickyStack se não for usar mais
// import StickySection from "@/components/StickySection";
// import useStickyStack from "@/hooks/useStickyStack";

const Index = () => {
  // Remova a referência do hook
  // const containerRef = useStickyStack();

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero normal sem o efeito sticky */}
      <section id="inicio">
        <Hero />
      </section>
        
      {/* Galeria como seção normal */}
      <section id="albuns" className="bg-background">
        <Gallery />
      </section>
      
      {/* Demais seções continuam iguais */}
      <section id="sobre">
        <About />
      </section>
      <section id="servicos">
        <Services />
      </section>
      <section id="depoimentos">
        <Testimonials />
      </section>
      <section id="contato">
        <Contact />
      </section>
      <Footer />
    </main>
  );
};

export default Index;