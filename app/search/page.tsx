'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Masonry from 'react-masonry-css';
import { Spinner } from '@/components/ui/spinner';
import { ComponentCard } from '@/components/ui/component-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Component } from '@/lib/types';
import { MainNav } from '@/components/main-nav';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    fetchSearchResults(query);
  }, [query]);

  async function fetchSearchResults(searchQuery: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/components/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      setComponents(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  }

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <>
      <MainNav />
      <div className="container mx-auto px-4 pt-24 lg:pt-24 lg:pl-60">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search Results: {query}
          </h1>
          <p className="text-muted-foreground">
            {components.length} components found
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        ) : components.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl mb-4">No components found for "{query}"</p>
            <Button asChild>
              <Link href="/">Browse All Components</Link>
            </Button>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {components.map((component) => (
              <div key={component.id} className="mb-4">
                <ComponentCard component={component} />
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </>
  );
} 