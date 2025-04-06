'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { ComponentCard } from '@/components/ui/component-card';
import { Component, Category, Subcategory } from '@/lib/types';
import { MainNav } from '@/components/main-nav';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubcategoryPage() {
  const params = useParams();
  const [components, setComponents] = useState<Component[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching components for subcategory:', params.subcategoryId);
        
        // Use the dedicated subcategory API endpoint
        const response = await fetch(
          `/api/components/subcategory?subcategoryId=${params.subcategoryId}`
        );
        
        if (!response.ok) {
          // Get detailed error message from response if possible
          let errorDetail = '';
          try {
            const errorData = await response.json();
            errorDetail = errorData.error || '';
          } catch (e) {
            // If we can't parse the JSON, just use the status text
            errorDetail = response.statusText;
          }
          
          console.error('API response not OK:', response.status, errorDetail);
          throw new Error(`Failed to fetch components: ${errorDetail} (${response.status})`);
        }

        const data = await response.json();
        console.log('Data received:', {
          categoryName: data.category?.name,
          subcategoryName: data.subcategory?.name,
          componentsCount: data.components?.length || 0
        });
        
        setCategory(data.category);
        setSubcategory(data.subcategory);
        setComponents(data.components || []);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch components');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.subcategoryId) {
      fetchData();
    } else {
      console.error('No subcategoryId provided in params');
      setError('Missing subcategory identifier');
      setIsLoading(false);
    }
  }, [params.subcategoryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const breakpointColumns = {
    default: 4,
    1536: 3,
    1280: 3,
    1024: 2,
    768: 2,
    640: 1
  };

  return (
    <>
      <MainNav />
      <main className="pt-16 lg:pl-60">
        <div className="container mx-auto p-4">
          <div className="mb-8">
            <Link 
              href={`/category/${params.categoryId}`}
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to {category?.name}
            </Link>
            <h1 className="text-3xl font-bold">{category?.name}</h1>
            <h2 className="text-xl text-muted-foreground mt-2">{subcategory?.name}</h2>
          </div>
          
          {components.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {components.map((component) => {
                const aspectRatio = component.dimensions?.height 
                  ? (component.dimensions.height / component.dimensions.width) * 100 
                  : 75;
                return (
                  <ComponentCard key={component.id} component={component} aspectRatio={aspectRatio} />
                );
              })}
            </Masonry>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No components found in this subcategory.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}