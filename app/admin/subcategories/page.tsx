'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, ChevronRight, FileImage, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Subcategory } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (svgFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgPreview(e.target?.result as string);
      };
      reader.readAsDataURL(svgFile);
    } else {
      setSvgPreview('');
    }
  }, [svgFile]);

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
      .select(`
        *,
        category:categories(*)
      `)
      .order('name');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch subcategories', variant: 'destructive' });
      return;
    }

    setSubcategories(data);
  }

  function validateForm() {
    const errors: Record<string, string> = {};

    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length > MAX_NAME_LENGTH) {
      errors.name = `Name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (selectedCategories.length === 0) {
      errors.categories = 'At least one category must be selected';
    }

    if (svgFile && svgFile.size > MAX_FILE_SIZE) {
      errors.svg = 'SVG file must be less than 2MB';
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async function uploadSvg(file: File): Promise<string> {
    if (!file || !file.type.includes('svg')) {
      throw new Error('Please upload a valid SVG file');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(`subcategories/${fileName}`, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(`subcategories/${fileName}`);

    return publicUrl;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let svgUrl = '';
      if (svgFile) {
        svgUrl = await uploadSvg(svgFile);
      }

      const subcategoryData = {
        name,
        description,
        svg_logo: svgUrl,
        image_url: imageUrl,
      };

      for (const categoryId of selectedCategories) {
        await supabase
          .from('subcategories')
          .insert([{ ...subcategoryData, category_id: categoryId }]);
      }

      toast({ title: 'Success', description: 'Subcategory saved successfully' });
      resetForm();
      fetchSubcategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save subcategory',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Subcategory deleted successfully' });
      fetchSubcategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subcategory',
        variant: 'destructive'
      });
    }
  }

  function resetForm() {
    setName('');
    setDescription('');
    setImageUrl('');
    setSvgFile(null);
    setSvgPreview('');
    setSelectedCategories([]);
    setValidationErrors({});
    setEditingSubcategory(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold">Subcategories</h1>
        <nav className="ml-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>Admin</li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>Subcategories</li>
          </ol>
        </nav>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX_NAME_LENGTH}
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
                <p className="text-xs text-gray-500">
                  {name.length}/{MAX_NAME_LENGTH} characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categories</label>
                <Select
                  value={selectedCategories[0]}
                  onValueChange={(value) => setSelectedCategories([value])}
                >
                  <SelectTrigger className={validationErrors.categories ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.categories && (
                  <p className="text-sm text-red-500">{validationErrors.categories}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {description.length}/{MAX_DESCRIPTION_LENGTH} characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SVG Logo</label>
                <Input
                  type="file"
                  accept=".svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSvgFile(file);
                  }}
                  className={validationErrors.svg ? 'border-red-500' : ''}
                />
                {validationErrors.svg && (
                  <p className="text-sm text-red-500">{validationErrors.svg}</p>
                )}
                {svgPreview && (
                  <div className="mt-2 p-4 border rounded">
                    <img
                      src={svgPreview}
                      alt="SVG Preview"
                      className="max-w-full h-auto max-h-32"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={validationErrors.imageUrl ? 'border-red-500' : ''}
                />
                {validationErrors.imageUrl && (
                  <p className="text-sm text-red-500">{validationErrors.imageUrl}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className="p-4 bg-card rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium">{subcategory.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {subcategory.description || 'No description'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Category: {subcategory.category?.name}</span>
                  {subcategory.svg_logo && (
                    <span className="flex items-center">
                      <FileImage className="h-4 w-4 mr-1" />
                      SVG Logo
                    </span>
                  )}
                  {subcategory.image_url && (
                    <span className="flex items-center">
                      <Image className="h-4 w-4 mr-1" />
                      Image
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSubcategory(subcategory);
                    setName(subcategory.name);
                    setDescription(subcategory.description || '');
                    setImageUrl(subcategory.image_url || '');
                    setSelectedCategories([subcategory.category_id]);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this subcategory? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(subcategory.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}