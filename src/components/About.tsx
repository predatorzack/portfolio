const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-8">
            About Me
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground">
            <p className="animate-fade-in">
              I'm a passionate developer and designer with over 5 years of experience creating digital products that make a difference. My journey in tech started with a curiosity about how things work and evolved into a career building beautiful, functional applications.
            </p>
            
            <p className="animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
              I specialize in modern web technologies and love bringing ideas to life through clean code and thoughtful design. Whether it's a complex web application or a simple landing page, I approach every project with the same attention to detail and commitment to excellence.
            </p>
            
            <p className="animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
              When I'm not coding, you'll find me exploring new design trends, contributing to open-source projects, or sharing knowledge with the developer community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
