'use client';

import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { ComponentCard } from '@/components/ui/component-card';
import { Component } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientComponents() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  const breakpointColumns = {
    default: 3,
    1536: 3,
    1280: 3,
    1024: 2,
    768: 2,
    640: 1
  };

  useEffect(() => {
    async function fetchComponents() {
      try {
        const response = await fetch('/api/components');
        if (!response.ok) {
          throw new Error('Failed to fetch components');
        }
        const data = await response.json();
        // Limit to 6 components for the landing page
        setComponents(data.slice(0, 6));
      } catch (error: any) {
        console.error('Error fetching components:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchComponents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {components.map((component) => (
          <ComponentCard
            key={component.id}
            component={component}
            aspectRatio={component.dimensions?.height
              ? (component.dimensions.height / component.dimensions.width) * 100
              : 75}
          />
        ))}
      </Masonry>
      
      <div className="mt-12 text-center">
        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/category/e3b2f5f8-1e23-4ed5-9354-c67025db46f7">
            View All Components
          </Link>
        </Button>
      </div>
    </div>
  );
}