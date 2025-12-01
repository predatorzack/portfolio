import { Button } from "@/components/ui/button";
import { ArrowDown, Download } from "lucide-react";

const Hero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Space_Grotesk'] text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Hi, I'm{" "}
            <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              Sohit Kumar
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
            Product Manager
          </p>
          
          <p className="text-lg text-primary-foreground/60 max-w-2xl mx-auto mb-12 animate-fade-in-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
            5+ years leading cross-functional teams to build and scale AI-driven and B2B SaaS products. From ideation to GTM revenue, optimizing user experiences across large-scale systems.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-lg px-8 animate-glow"
              onClick={() => scrollToSection("products")}
            >
              View Case Studies
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-medium text-lg px-8"
              onClick={() => scrollToSection("contact")}
            >
              Get In Touch
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-medium text-lg px-8 gap-2"
              onClick={() => window.open('/Sohit_Kumar_Resume.pdf', '_blank')}
            >
              <Download size={20} />
              Resume
            </Button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => scrollToSection("about")}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors animate-bounce cursor-pointer"
        aria-label="Scroll to about section"
      >
        <ArrowDown size={32} />
      </button>
    </section>
  );
};

export default Hero;
