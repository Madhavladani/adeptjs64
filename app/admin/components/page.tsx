'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  ChevronRight,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  Image as ImageIcon,
  Figma,
  Frame,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Category, Subcategory, Component } from '@/lib/types';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [figmaEnabled, setFigmaEnabled] = useState(false);
  const [figmaCode, setFigmaCode] = useState('');
  const [framerEnabled, setFramerEnabled] = useState(false);
  const [framerCode, setFramerCode] = useState('');
  const [webflowEnabled, setWebflowEnabled] = useState(false);
  const [webflowCode, setWebflowCode] = useState('');

  const { toast } = useToast();
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchComponents();
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const filtered = subcategories.filter(sub =>
        selectedCategories.includes(sub.category_id)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories(subcategories);
    }
  }, [selectedCategories, subcategories]);

  async function fetchComponents() {
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        component_categories(category_id),
        component_subcategories(subcategory_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch components', variant: 'destructive' });
      return;
    }

    setComponents(data || []);
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
      return;
    }

    setCategories(data);
  }

  async function fetchSubcategories() {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch subcategories', variant: 'destructive' });
      return;
    }

    setSubcategories(data);
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Insert component
      const { data: component, error: componentError } = await supabase
        .from('components')
        .insert([{
          name,
          description,
          image_url: imageUrl,
          is_public: isPublic,
          is_pro: isPro,
          figma_code: figmaEnabled ? figmaCode : null,
          framer_code: framerEnabled ? framerCode : null,
          webflow_code: webflowEnabled ? webflowCode : null,
        }])
        .select()
        .single();

      if (componentError) throw componentError;

      // Insert category relationships
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          component_id: component.id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('component_categories')
          .insert(categoryRelations);

        if (categoryError) throw categoryError;
      }

      // Insert subcategory relationships
      if (selectedSubcategories.length > 0) {
        const subcategoryRelations = selectedSubcategories.map(subcategoryId => ({
          component_id: component.id,
          subcategory_id: subcategoryId,
        }));

        const { error: subcategoryError } = await supabase
          .from('component_subcategories')
          .insert(subcategoryRelations);

        if (subcategoryError) throw subcategoryError;
      }

      toast({ title: 'Success', description: 'Component saved successfully' });
      resetForm();
      fetchComponents();
    } catch (error) {
      console.error('Error saving component:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save component',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  }

  async function handleDelete(ids: string[]) {
    try {
      const { error } = await supabase
        .from('components')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast({ title: 'Success', description: 'Components deleted successfully' });
      setSelectedComponents([]);
      fetchComponents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete components',
        variant: 'destructive'
      });
    }
  }

  function validateForm() {
    if (!name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return false;
    }
    if (!description) {
      toast({ title: 'Error', description: 'Description is required', variant: 'destructive' });
      return false;
    }
    if (!imageUrl) {
      toast({ title: 'Error', description: 'Image URL is required', variant: 'destructive' });
      return false;
    }
    return true;
  }

  function resetForm() {
    setName('');
    setDescription('');
    setImageUrl('');
    setIsPublic(true);
    setIsPro(false);
    setFigmaEnabled(false);
    setFigmaCode('');
    setFramerEnabled(false);
    setFramerCode('');
    setWebflowEnabled(false);
    setWebflowCode('');
    setSelectedCategories([]);
    setSelectedSubcategories([]);
  }

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      const componentCategoryIds = component.component_categories?.map(cc => cc.category_id) || [];
      const hasMatchingCategory = selectedCategories.some(id => componentCategoryIds.includes(id));
      if (!hasMatchingCategory) return false;
    }

    // Filter by selected subcategories
    if (selectedSubcategories.length > 0) {
      const componentSubcategoryIds = component.component_subcategories?.map(cs => cs.subcategory_id) || [];
      const hasMatchingSubcategory = selectedSubcategories.some(id => componentSubcategoryIds.includes(id));
      if (!hasMatchingSubcategory) return false;
    }

    return true;
  });

  const paginatedComponents = filteredComponents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Components</h1>
        <Button onClick={() => router.push('/admin/components/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:w-4/5 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search components..."
                className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedComponents.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedComponents.length} selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the selected components and remove them from your database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(selectedComponents)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

          <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
                  <TableHead className="w-10">
                <Checkbox
                      checked={selectedComponents.length === paginatedComponents.length && paginatedComponents.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                          setSelectedComponents(paginatedComponents.map(comp => comp.id));
                    } else {
                      setSelectedComponents([]);
                    }
                  }}
                />
              </TableHead>
                  <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
                {paginatedComponents.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedComponents.includes(component.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedComponents(prev => [...prev, component.id]);
                        } else {
                            setSelectedComponents(prev =>
                              prev.filter(id => id !== component.id)
                            );
                        }
                      }}
                    />
                  </TableCell>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded overflow-hidden">
                        <img
                          src={component.image_url}
                          alt={component.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{component.name}</div>
                    </TableCell>
                  <TableCell>
                      <div className="flex gap-2">
                      {component.is_public ? (
                          <div className="flex items-center text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </div>
                      ) : (
                          <div className="flex items-center text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Private
                          </div>
                      )}
                      {component.is_pro && (
                          <div className="flex items-center text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            <Crown className="h-3 w-3 mr-1" />
                            Pro
                          </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {component.component_categories?.map((cc, index) => {
                          const category = categories.find(c => c.id === cc.category_id);
                          return category ? (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            >
                              {category.name}
                            </span>
                          ) : null;
                        })}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {component.component_subcategories?.map((cs, index) => {
                          const subcategory = subcategories.find(s => s.id === cs.subcategory_id);
                          return subcategory ? (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            >
                              {subcategory.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                  </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {}}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
                {paginatedComponents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No components found
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredComponents.length)} of{' '}
                {filteredComponents.length} results
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
            <Button
                  variant="outline"
              size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
            >
                  Next
            </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-1/5 space-y-4">
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Filter by Category</h3>
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories(prev => [...prev, category.id]);
                    } else {
                      setSelectedCategories(prev =>
                        prev.filter(id => id !== category.id)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}

            <h3 className="font-medium pt-2">Filter by Subcategory</h3>
            {filteredSubcategories.map(subcategory => (
              <div key={subcategory.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`subcategory-${subcategory.id}`}
                  checked={selectedSubcategories.includes(subcategory.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSubcategories(prev => [...prev, subcategory.id]);
                    } else {
                      setSelectedSubcategories(prev =>
                        prev.filter(id => id !== subcategory.id)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`subcategory-${subcategory.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {subcategory.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}