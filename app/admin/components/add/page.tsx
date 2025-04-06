'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Category, Subcategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AddComponentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_public: true,
    is_pro: false,
    figma_code: '',
    framer_code: '',
    webflow_code: '',
  });
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  
  // Fetch categories and subcategories
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData || []);
        
        // Fetch subcategories with their parent categories
        const subcategoriesResponse = await fetch('/api/subcategories');
        if (!subcategoriesResponse.ok) {
          throw new Error('Failed to fetch subcategories');
        }
        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(subcategoriesData || []);
        setFilteredSubcategories(subcategoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories and subcategories',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [toast]);
  
  // Filter subcategories when selected categories change
  useEffect(() => {
    if (selectedCategoryIds.length === 0) {
      // If no categories selected, show all subcategories
      setFilteredSubcategories(subcategories);
    } else {
      // Filter subcategories to only show those in selected categories
      const filtered = subcategories.filter(
        (sub) => selectedCategoryIds.includes(sub.category_id)
      );
      setFilteredSubcategories(filtered);
    }
  }, [selectedCategoryIds, subcategories]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };
  
  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryIds((current) =>
      current.includes(subcategoryId)
        ? current.filter(id => id !== subcategoryId)
        : [...current, subcategoryId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.image_url) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use our API endpoint instead of direct Supabase calls
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category_ids: selectedCategoryIds,
          subcategory_ids: selectedSubcategoryIds,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create component');
      }
      
      toast({
        title: 'Success',
        description: 'Component created successfully',
      });
      
      // Redirect to components list
      router.push('/admin/components');
    } catch (error) {
      console.error('Error creating component:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create component',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Component</h1>
        <Button onClick={() => router.push('/admin/components')}>
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Categories</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedCategoryIds.length > 0
                      ? `${selectedCategoryIds.length} categories selected`
                      : "Select categories..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => toggleCategory(category.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategoryIds.includes(category.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Display selected categories as badges */}
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategoryIds.map((id) => {
                    const category = categories.find((c) => c.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {category?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleCategory(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div>
              <Label>Subcategories</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedSubcategoryIds.length > 0
                      ? `${selectedSubcategoryIds.length} subcategories selected`
                      : "Select subcategories..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search subcategories..." />
                    <CommandEmpty>No subcategories found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {filteredSubcategories.map((subcategory) => (
                        <CommandItem
                          key={subcategory.id}
                          value={subcategory.name}
                          onSelect={() => toggleSubcategory(subcategory.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSubcategoryIds.includes(subcategory.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {subcategory.name}
                          {subcategory.category && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({(subcategory.category as any).name})
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Display selected subcategories as badges */}
              {selectedSubcategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSubcategoryIds.map((id) => {
                    const subcategory = subcategories.find((s) => s.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {subcategory?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleSubcategory(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleSwitchChange('is_public', checked)}
              />
              <Label htmlFor="is_public">Public</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_pro"
                checked={formData.is_pro}
                onCheckedChange={(checked) => handleSwitchChange('is_pro', checked)}
              />
              <Label htmlFor="is_pro">Pro</Label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="figma_code">Figma Code</Label>
            <Input
              id="figma_code"
              name="figma_code"
              value={formData.figma_code}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="framer_code">Framer Code</Label>
            <Input
              id="framer_code"
              name="framer_code"
              value={formData.framer_code}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webflow_code">Webflow Code</Label>
            <Input
              id="webflow_code"
              name="webflow_code"
              value={formData.webflow_code}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/components')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Component'}
          </Button>
        </div>
      </form>
    </div>
  );
} 