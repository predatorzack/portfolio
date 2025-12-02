import { Card } from "@/components/ui/card";
import { GraduationCap, ExternalLink } from "lucide-react";
import EmbeddedChat from "./EmbeddedChat";

const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-8">
            About Me
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Text Content */}
            <div className="space-y-6">
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
              </div>

              <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 animate-fade-in [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <GraduationCap className="w-8 h-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                      Education
                    </h3>
                    <p className="text-foreground font-medium mb-1">Bachelor of Technology (B.Tech), Mechanical Engineering</p>
                    <a href="https://www.iitism.ac.in/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 font-medium inline-flex items-center gap-2 transition-colors group">
                      Indian Institute of Technology (ISM) Dhanbad
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <p className="text-muted-foreground mt-1">CGPA: 8.26/10 | 2013-2017</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Embedded Chat */}
            <div className="lg:sticky lg:top-24 animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
              <EmbeddedChat />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
