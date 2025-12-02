import { Card } from "@/components/ui/card";
import { Brain, Users, Rocket, TrendingUp, Target, Lightbulb } from "lucide-react";

const skills = [
  {
    icon: Brain,
    title: "AI/ML Products",
    description: "Conversational AI, RAG frameworks, multi-agent systems, prompt engineering",
    color: "from-purple-500/10 to-pink-500/10"
  },
  {
    icon: Target,
    title: "Product Strategy",
    description: "0-to-1 launches, roadmap planning, GTM strategy, revenue generation",
    color: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: Users,
    title: "Leadership",
    description: "Cross-functional teams, mentoring, stakeholder management, Agile methodology",
    color: "from-green-500/10 to-emerald-500/10"
  },
  {
    icon: TrendingUp,
    title: "B2B SaaS",
    description: "Enterprise sales, API integrations, scalability, multi-tenant architecture",
    color: "from-orange-500/10 to-red-500/10"
  },
  {
    icon: Lightbulb,
    title: "User Experience",
    description: "User research, journey mapping, retention optimization, A/B testing",
    color: "from-yellow-500/10 to-amber-500/10"
  },
  {
    icon: Rocket,
    title: "Data & Analytics",
    description: "Metrics definition, SQL & Excel, data-driven decisions, ranking algorithms",
    color: "from-indigo-500/10 to-violet-500/10"
  }
];

const Skills = () => {
  return (
    <section className="py-24 bg-section-bg">
      <div className="container mx-auto px-6">
        <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          Core Competencies
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
