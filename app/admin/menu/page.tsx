'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, FolderTree, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [menuItems, setMenuItems] = useState<Array<{ id: string; type: 'category' | 'subcategory'; data: any }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('created_at');

      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData);

      // Fetch menu order
      const { data: menuOrderData, error: menuOrderError } = await supabase
        .from('menu_order')
        .select('*')
        .order('position');

      if (menuOrderError) throw menuOrderError;

      // Combine all items based on menu order
      if (menuOrderData && menuOrderData.length > 0) {
        const orderedItems = menuOrderData.map(order => {
          const item = order.item_type === 'category'
            ? categoriesData.find(c => c.id === order.item_id)
            : subcategoriesData.find(s => s.id === order.item_id);
          return {
            id: order.item_id,
            type: order.item_type,
            data: item
          };
        });
        setMenuItems(orderedItems);
      } else {
        // Initial setup: combine categories and subcategories
        const initialItems = [
          ...categoriesData.map(c => ({ id: c.id, type: 'category' as const, data: c })),
          ...subcategoriesData.map(s => ({ id: s.id, type: 'subcategory' as const, data: s }))
        ];
        setMenuItems(initialItems);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDragEnd(result: any) {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuItems(items);

    try {
      // Delete existing order
      await supabase.from('menu_order').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new order
      const { error } = await supabase.from('menu_order').insert(
        items.map((item, index) => ({
          item_id: item.id,
          item_type: item.type,
          position: index
        }))
      );

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Menu order updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update menu order',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string, type: 'category' | 'subcategory') {
    try {
      const { error } = await supabase
        .from(type === 'category' ? 'categories' : 'subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(menuItems.filter(item => item.id !== id));
      if (type === 'category') {
        setCategories(categories.filter(category => category.id !== id));
      } else {
        setSubcategories(subcategories.filter(subcategory => subcategory.id !== id));
      }

      toast({
        title: 'Success',
        description: `${type === 'category' ? 'Category' : 'Subcategory'} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${type}`,
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      // Delete existing order
      await supabase.from('menu_order').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new order
      const { error } = await supabase.from('menu_order').insert(
        menuItems.map((item, index) => ({
          item_id: item.id,
          item_type: item.type,
          position: index
        }))
      );

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Menu order saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save menu order',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      // Fetch latest categories and subcategories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');

      if (categoriesError) throw categoriesError;

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('created_at');

      if (subcategoriesError) throw subcategoriesError;

      // Get existing menu order
      const { data: existingOrder } = await supabase
        .from('menu_order')
        .select('*')
        .order('position');

      // Create a set of existing IDs in menu_order
      const existingIds = new Set(existingOrder?.map(item => item.item_id) || []);

      // Find new items not in menu_order
      const newCategories = categoriesData.filter(c => !existingIds.has(c.id));
      const newSubcategories = subcategoriesData.filter(s => !existingIds.has(s.id));

      // Add new items to menu_order
      if (newCategories.length > 0 || newSubcategories.length > 0) {
        const lastPosition = existingOrder?.length || 0;
        const newItems = [
          ...newCategories.map((c, i) => ({
            item_id: c.id,
            item_type: 'category',
            position: lastPosition + i
          })),
          ...newSubcategories.map((s, i) => ({
            item_id: s.id,
            item_type: 'subcategory',
            position: lastPosition + newCategories.length + i
          }))
        ];

        const { error: insertError } = await supabase
          .from('menu_order')
          .insert(newItems);

        if (insertError) throw insertError;
      }

      await fetchData();
      toast({
        title: 'Success',
        description: `Menu refreshed with ${newCategories.length} new categories and ${newSubcategories.length} new subcategories`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh menu items',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Drag and drop items to arrange the menu order
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Items'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Menu Order'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu-items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {menuItems.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center space-x-4 p-4 bg-card rounded-lg border"
                      >
                        <div {...provided.dragHandleProps}>
                          <Grip className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.type === 'category' ? (
                            <FolderTree className="w-4 h-4 text-blue-500" />
                          ) : (
                            <List className="w-4 h-4 text-green-500" />
                          )}
                          <div className="font-medium">{item.data.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ({item.type})
                          </div>
                        </div>
                        <div className="flex-1">
                          {item.data.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.data.description}
                            </div>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete {item.type === 'category' ? 'Category' : 'Subcategory'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this {item.type}?
                                {item.type === 'category' && ' This will also delete all associated subcategories.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id, item.type)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}