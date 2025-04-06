'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Search, Image, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { Category, Subcategory } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);

  // New state for enhanced fields
  const [description, setDescription] = useState('');
  const [svgLogo, setSvgLogo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [subSvgFile, setSubSvgFile] = useState<File | null>(null);
  const [subSvgPreview, setSubSvgPreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  // SVG preview effect for category
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

  // SVG preview effect for subcategory
  useEffect(() => {
    if (subSvgFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSubSvgPreview(e.target?.result as string);
      };
      reader.readAsDataURL(subSvgFile);
    } else {
      setSubSvgPreview('');
    }
  }, [subSvgFile]);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error.message);
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
      return;
    }

    setCategories(data);
    setFilteredCategories(data);
  }

  async function fetchSubcategories() {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subcategories:', error.message);
      toast({ title: 'Error', description: 'Failed to fetch subcategories', variant: 'destructive' });
      return;
    }

    setSubcategories(data);
  }

  async function uploadSvg(file: File, folder: 'categories' | 'subcategories'): Promise<string> {
    if (!file || !file.type.includes('svg')) {
      throw new Error('Please upload a valid SVG file');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(`${folder}/${fileName}`, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(`${folder}/${fileName}`);

    return publicUrl;
  }

  async function handleAddCategory() {
    let uploadedSvgUrl = '';
    
    try {
      if (svgFile) {
        uploadedSvgUrl = await uploadSvg(svgFile, 'categories');
      }

      const categoryData = {
        name: newCategoryName,
        description,
        svg_logo: uploadedSvgUrl || svgLogo,
        image_url: imageUrl
      };

      const { error } = await supabase
        .from('categories')
        .insert([categoryData]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Category added successfully' });
      setNewCategoryName('');
      setDescription('');
      setSvgLogo('');
      setImageUrl('');
      setSvgFile(null);
      setSvgPreview('');
      setIsAddingCategory(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to add category',
        variant: 'destructive'
      });
    }
  }

  async function handleAddSubcategory() {
    let uploadedSvgUrl = '';

    try {
      if (subSvgFile) {
        uploadedSvgUrl = await uploadSvg(subSvgFile, 'subcategories');
      }

      const subcategoryData = {
        name: newSubcategoryName,
        category_id: selectedCategory,
        svg_logo: uploadedSvgUrl
      };

      const { error } = await supabase
        .from('subcategories')
        .insert([subcategoryData]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Subcategory added successfully' });
      setNewSubcategoryName('');
      setSelectedCategory('');
      setSubSvgFile(null);
      setSubSvgPreview('');
      setIsAddingSubcategory(false);
      fetchSubcategories();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to add subcategory',
        variant: 'destructive'
      });
    }
  }

  function handleSvgFileChange(e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) {
    const file = e.target.files?.[0];
    if (file && !file.type.includes('svg')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an SVG file',
        variant: 'destructive'
      });
      return;
    }
    setFile(file || null);
  }

  async function handleDeleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error.message);
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
      return;
    }

    fetchCategories();
  }

  async function handleDeleteSubcategory(id: string) {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subcategory:', error.message);
      toast({ title: 'Error', description: 'Failed to delete subcategory', variant: 'destructive' });
      return;
    }

    fetchSubcategories();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold">Categories & Subcategories</h1>
        <nav className="ml-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>Admin</li>
            <li>/</li>
            <li>Categories</li>
          </ol>
        </nav>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 w-64"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-x-4">
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    placeholder="Category Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SVG Logo</label>
                  <Input
                    type="file"
                    accept=".svg"
                    onChange={(e) => handleSvgFileChange(e, setSvgFile)}
                  />
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
                <div>
                  <label className="block text-sm font-medium mb-1">SVG Logo URL</label>
                  <Input
                    placeholder="SVG Logo URL"
                    value={svgLogo}
                    onChange={(e) => setSvgLogo(e.target.value)}
                    disabled={!!svgFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Either upload a file or provide a URL
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Subcategory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subcategory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-sm font-medium mb-1">SVG Logo</label>
                  <Input
                    type="file"
                    accept=".svg"
                    onChange={(e) => handleSvgFileChange(e, setSubSvgFile)}
                  />
                  {subSvgPreview && (
                    <div className="mt-2 p-4 border rounded">
                      <img
                        src={subSvgPreview}
                        alt="SVG Preview"
                        className="max-w-full h-auto max-h-32"
                      />
                    </div>
                  )}
                </div>
                <Input
                  placeholder="Subcategory Name"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                />
                <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="space-y-2">
            {filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((category) => (
              <div
                key={category.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                    <div className="flex items-center space-x-4">
                      {category.svg_logo && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FileImage className="h-4 w-4 mr-1" />
                          <span>SVG Logo</span>
                        </div>
                      )}
                      {category.image_url && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Image className="h-4 w-4 mr-1" />
                          <span>Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
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
          {filteredCategories.length > itemsPerPage && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{subcategory.name}</div>
                    <div className="text-sm text-gray-500">
                      Category: {subcategory.category?.name}
                    </div>
                  </div>
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
                        <AlertDialogAction onClick={() => handleDeleteSubcategory(subcategory.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}