'use client';

import { Figma, Framer, Globe, Layers, Zap, Code } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 rounded-lg p-3 mr-4 text-indigo-600">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      title: 'Figma Components',
      description: 'Ready-to-use components and templates for Figma. Just copy and paste into your projects.',
      icon: <Figma className="h-6 w-6" />
    },
    {
      title: 'Framer Templates',
      description: 'Beautiful Framer components to quickly prototype and build interactive designs.',
      icon: <Framer className="h-6 w-6" />
    },
    {
      title: 'Webflow Ready',
      description: 'Integration-ready components for Webflow to build professional websites faster.',
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: 'Modular Design',
      description: 'All components are modular and can be easily combined to create complex interfaces.',
      icon: <Layers className="h-6 w-6" />
    },
    {
      title: 'Performance Optimized',
      description: 'Lightweight and optimized components that won\'t slow down your application.',
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: 'Developer Friendly',
      description: 'Clean code that follows best practices and is easy to implement in your projects.',
      icon: <Code className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Components</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Designed to help you build faster and more efficiently with ready-to-use components
            for various design platforms.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 