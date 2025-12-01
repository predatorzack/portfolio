import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, ExternalLink } from "lucide-react";

const products = [
  {
    company: "Alphadroid",
    companyUrl: "https://www.alphadroid.io/",
    role: "Product Manager",
    period: "Apr 2024 - Present",
    title: "HeyAlpha - Conversational AI SaaS Platform",
    description: "Led strategy, roadmap, and launch of a multi-agent conversational AI platform enabling automated patient care, guest management, and enterprise workflows",
    achievements: [
      "Led team of 12 (devs, AI engineers, QA, design) and mentored 2 Product Analysts",
      "Launched 0-to-1 revenue stream, generating 5M INR in first year",
      "Scaled AI-driven self check-in/out for 20 hotels",
      "Deployed patient registration and voice navigation for 10 hospitals",
      "Enabled 30k+ user interactions per day across multiple industries"
    ],
    metrics: [
      { icon: TrendingUp, label: "5M INR", sublabel: "First Year Revenue" },
      { icon: Users, label: "30k+", sublabel: "Daily Interactions" },
      { icon: Zap, label: "30+", sublabel: "Enterprise Deployments" }
    ],
    tags: ["AI/ML", "Multi-Agent Systems", "B2B SaaS", "Healthcare", "Hospitality"],
    color: "from-purple-500/5 to-pink-500/5"
  },
  {
    company: "DotPe",
    companyUrl: "https://www.dotpe.in/",
    role: "Product Manager",
    period: "Jul 2021 - Oct 2022",
    title: "Bifrost - B2B SaaS Platform for FnB",
    description: "Built comprehensive platform to manage catalog and order processing for FnB merchants, onboarding major enterprise clients",
    achievements: [
      "Onboarded McDonald's and Haldiram's as enterprise clients",
      "Generated 4M INR in ARR",
      "Processed 10M+ lifetime orders",
      "Led development of Fine Dine Suite with kitchen dashboards and waiter app",
      "Reduced table turnaround time by 20%",
      "Improved delivery metrics from 97% to 98.2% using data-based ranking algorithms"
    ],
    metrics: [
      { icon: TrendingUp, label: "4M INR", sublabel: "Annual Revenue" },
      { icon: Users, label: "10M+", sublabel: "Orders Processed" },
      { icon: Zap, label: "20%", sublabel: "Turnaround Reduction" }
    ],
    tags: ["B2B SaaS", "FnB Tech", "Enterprise Sales", "Order Management"],
    color: "from-orange-500/5 to-red-500/5"
  },
  {
    company: "ElectricPe",
    companyUrl: "https://electricpe.com/",
    role: "Product Manager",
    period: "May 2023 - Oct 2023",
    title: "B2C User Retention & Growth",
    description: "Drove significant improvements in user retention and engagement through gamification and UX optimization",
    achievements: [
      "Improved 12-week user retention from 60% to 85%",
      "Implemented gamified rewards system",
      "Redesigned onboarding journeys",
      "Revamped in-app support & feedback system",
      "Enhanced company website for better SEO and lead generation"
    ],
    metrics: [
      { icon: TrendingUp, label: "85%", sublabel: "User Retention" },
      { icon: Users, label: "25%", sublabel: "Retention Increase" },
      { icon: Zap, label: "Web", sublabel: "SEO & Conversion" }
    ],
    tags: ["B2C", "User Retention", "Gamification", "UX Design"],
    color: "from-green-500/5 to-emerald-500/5"
  },
  {
    company: "Spinny",
    companyUrl: "https://www.spinny.com/",
    role: "Associate Program Manager",
    period: "Mar 2019 - Jul 2021",
    title: "Refurbishment CRM & Operations",
    description: "Developed internal products to standardize operations and scale refurbishment processes",
    achievements: [
      "Increased refurbished cars/month by 10x",
      "Reduced turnaround time (TAT) by 37%",
      "Improved inspection accuracy with image & sound processing algorithms",
      "Drove 15% operational cost reduction through automation",
      "Created dashboards & analytics tools for data-driven decisions"
    ],
    metrics: [
      { icon: TrendingUp, label: "10x", sublabel: "Volume Increase" },
      { icon: Users, label: "37%", sublabel: "TAT Reduction" },
      { icon: Zap, label: "15%", sublabel: "Cost Savings" }
    ],
    tags: ["Internal Tools", "Operations", "Automation", "Analytics"],
    color: "from-blue-500/5 to-cyan-500/5"
  }
];

const Products = () => {
  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Product Case Studies
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          End-to-end product leadership across AI platforms, B2B SaaS, and consumer applications
        </p>
        
        <div className="space-y-8 max-w-5xl mx-auto">
          {products.map((product, index) => (
            <Card 
              key={index}
              className={`p-8 border-border hover:border-accent transition-all duration-300 bg-gradient-to-br ${product.color} animate-fade-in-up`}
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground">
                      {product.title}
                    </h3>
                  </div>
                  <a 
                    href={product.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 font-medium inline-flex items-center gap-2 transition-colors group"
                  >
                    {product.company}
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <p className="text-sm text-muted-foreground">{product.role} • {product.period}</p>
                </div>
              </div>
              
              <p className="text-foreground mb-6">
                {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-background/50 rounded-lg">
                {product.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <metric.icon className="w-8 h-8 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-lg">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Key Achievements:</h4>
                <ul className="space-y-2">
                  {product.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-start">
                      <span className="text-accent mr-2 mt-1">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, tagIndex) => (
                  <Badge 
                    key={tagIndex}
                    variant="secondary"
                    className="bg-accent/10 text-accent hover:bg-accent/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
