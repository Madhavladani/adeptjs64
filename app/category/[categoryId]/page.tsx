'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MainNav } from '@/components/main-nav';
import { Category, Subcategory } from '@/lib/types';
import { SubcategoryCard } from '@/components/ui/subcategory-card';

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch category and its subcategories
        const subcategoriesResponse = await fetch(`/api/subcategories?categoryId=${params.categoryId}`);
        if (!subcategoriesResponse.ok) {
          throw new Error('Failed to fetch subcategories');
        }
        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(subcategoriesData.subcategories || []);
        setCategory(subcategoriesData.category);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.categoryId) {
      fetchData();
    }
  }, [params.categoryId]);

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

  return (
    <>
      <MainNav />
      <main className="pt-16 lg:pl-60">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-8">{category?.name}</h1>

          {/* Subcategories Section */}
          {subcategories.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">Subcategories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subcategories.map((subcategory) => (
                  <SubcategoryCard 
                    key={subcategory.id}
                    subcategory={subcategory}
                    categoryId={params.categoryId as string}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No subcategories found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}