import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github, Twitter } from "lucide-react";

const socialLinks = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com",
    color: "hover:text-foreground"
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com",
    color: "hover:text-blue-500"
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "https://twitter.com",
    color: "hover:text-sky-500"
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@example.com",
    color: "hover:text-accent"
  }
];

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-section-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-8">
            Let's Work Together
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            I'm always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hi, feel free to reach out!
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-12">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-accent transition-all duration-300 hover:scale-110 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
                aria-label={link.label}
              >
                <link.icon className={`w-8 h-8 text-muted-foreground transition-colors ${link.color}`} />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </a>
            ))}
          </div>
          
          <Button 
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-lg px-8 animate-glow"
            onClick={() => window.location.href = 'mailto:hello@example.com'}
          >
            Send Me an Email
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
