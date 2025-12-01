import { Button } from "@/components/ui/button";
import { Mail, Linkedin, MapPin, Phone } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91-9504974337",
    href: "tel:+919504974337",
    color: "hover:text-green-500"
  },
  {
    icon: Mail,
    label: "Email",
    value: "sohitkumar944@gmail.com",
    href: "mailto:sohitkumar944@gmail.com",
    color: "hover:text-accent"
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Connect on LinkedIn",
    href: "https://linkedin.com/in/sohitkumar944",
    color: "hover:text-blue-500"
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Noida, India",
    href: "#",
    color: "hover:text-red-500"
  }
];

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-section-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-8">
            Let's Connect
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            I'm always open to discussing product strategy, leadership opportunities, or collaboration on innovative projects. Feel free to reach out!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`group flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border hover:border-accent transition-all duration-300 hover:scale-105 animate-fade-in ${contact.href === '#' ? 'pointer-events-none' : ''}`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
                aria-label={contact.label}
              >
                <contact.icon className={`w-8 h-8 text-muted-foreground transition-colors ${contact.color}`} />
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{contact.label}</p>
                  <p className="text-sm text-foreground font-medium">{contact.value}</p>
                </div>
              </a>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-lg px-8 animate-glow"
              onClick={() => window.location.href = 'mailto:sohitkumar944@gmail.com'}
            >
              Send Me an Email
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted font-medium text-lg px-8"
              onClick={() => window.open('/Sohit_Kumar_Resume.pdf', '_blank')}
            >
              Download Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
