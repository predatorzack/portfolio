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
              I'm a Product Manager with 5 years of experience leading cross-functional teams to build and scale AI-driven and B2B SaaS products. I have strong business acumen to drive product lifecycle from ideation to GTM revenue, and optimizing user experiences across large-scale systems.
            </p>
            
            <p className="animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
              My journey includes leading the strategy and end-to-end launch of <strong>HeyAlpha</strong>, a multi-agent conversational AI platform for enterprise automation, where I led a team of 12 and generated 5M INR in first year revenue. At <strong>ElectricPe</strong>, I improved 12-week user retention from 60% to 85% through gamified rewards and redesigned onboarding.
            </p>
            
            <p className="animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
              At <strong>DotPe</strong>, I built Bifrost, a B2B SaaS platform that onboarded enterprise clients including McDonald's and Haldiram's, generating 4M INR in ARR and processing 10M+ lifetime orders. Previously at <strong>Spinny</strong>, I developed internal products that increased refurbished cars/month by 10x and drove 15% operational cost reduction.
            </p>

            <div className="pt-6 border-t border-border animate-fade-in [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
              <p className="text-foreground font-medium mb-2">Education</p>
              <p>Bachelor of Technology (B.Tech.), Mechanical Engineering</p>
              <p>Indian Institute of Technology ISM Dhanbad | CGPA: 8.26/10 | 2013-2017</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
