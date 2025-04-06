'use client';

import { Subcategory } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FolderTree } from 'lucide-react';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  categoryId: string;
}

export function SubcategoryCard({ subcategory, categoryId }: SubcategoryCardProps) {
  return (
    <Link href={`/category/${categoryId}/${subcategory.id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:border-orange-500 hover:shadow-md group cursor-pointer h-full">
        <CardContent className="p-0">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            {subcategory.image_url ? (
              <img
                src={subcategory.image_url}
                alt={subcategory.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <FolderTree className="w-12 h-12 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1 group-hover:text-orange-500 transition-colors">{subcategory.name}</h3>
            {subcategory.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{subcategory.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 