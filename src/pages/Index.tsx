import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <>
      <header>
        <Hero />
      </header>
      <main className="min-h-screen">
        <article id="about-section">
          <About />
        </article>
        <section id="skills-section" aria-label="Core Competencies">
          <Skills />
        </section>
        <section id="products-section" aria-label="Product Work">
          <Products />
        </section>
        <section id="contact-section" aria-label="Contact Information">
          <Contact />
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
};

export default Index;
