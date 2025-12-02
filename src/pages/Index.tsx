import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Skills />
      <Products />
      <Contact />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
