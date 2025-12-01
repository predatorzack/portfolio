import { Card } from "@/components/ui/card";
import { Code2, Palette, Rocket, Users } from "lucide-react";

const skills = [
  {
    icon: Code2,
    title: "Frontend Development",
    description: "React, TypeScript, Tailwind CSS, Next.js",
    color: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma, Adobe XD, Responsive Design, Design Systems",
    color: "from-purple-500/10 to-pink-500/10"
  },
  {
    icon: Rocket,
    title: "Backend & APIs",
    description: "Node.js, Express, REST APIs, Database Design",
    color: "from-green-500/10 to-emerald-500/10"
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Agile, Git, Code Reviews, Team Leadership",
    color: "from-orange-500/10 to-red-500/10"
  }
];

const Skills = () => {
  return (
    <section className="py-24 bg-section-bg">
      <div className="container mx-auto px-6">
        <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          Skills & Expertise
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {skills.map((skill, index) => (
            <Card 
              key={index}
              className={`p-6 border-border hover:border-accent transition-all duration-300 bg-gradient-to-br ${skill.color} hover:scale-105 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <skill.icon className="w-12 h-12 text-accent mb-4" />
              <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-foreground mb-2">
                {skill.title}
              </h3>
              <p className="text-muted-foreground">
                {skill.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
