import { useEffect } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  // Update document title for SPAs and add meta description dynamically
  useEffect(() => {
    document.title = "Sohit Kumar | Product Manager - AI & B2B SaaS Expert";
    
    // Update meta description if needed
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Sohit Kumar - Product Manager with 5+ years building AI-driven and B2B SaaS products. Expert in product strategy, user experience, and leading cross-functional teams from ideation to GTM revenue. IIT Dhanbad alumnus.'
      );
    }
  }, []);

  return (
    <>
      <header role="banner">
        <Hero />
      </header>
      <main className="min-h-screen" role="main">
        <article id="about-section" aria-labelledby="about-heading">
          <About />
        </article>
        <section id="skills-section" aria-labelledby="skills-heading">
          <Skills />
        </section>
        <section id="products-section" aria-labelledby="products-heading">
          <Products />
        </section>
        <section id="contact-section" aria-labelledby="contact-heading">
          <Contact />
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
};

export default Index;
