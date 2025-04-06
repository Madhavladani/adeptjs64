import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define interface for menu items
interface MenuItem {
  id: string;
  name: string;
  type: 'category' | 'subcategory';
  url: string;
}

export async function GET() {
  try {
    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    // Fetch all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*');

    if (subcategoriesError) throw subcategoriesError;

    // Fetch menu order
    const { data: menuOrder, error: menuOrderError } = await supabase
      .from('menu_order')
      .select('*')
      .order('position');

    if (menuOrderError) throw menuOrderError;

    // Create a flat menu structure based on menu_order
    let menuItems: MenuItem[] = [];
    
    if (menuOrder && menuOrder.length > 0) {
      // Map each menu order item to its corresponding category or subcategory
      menuItems = menuOrder.map(orderItem => {
        if (orderItem.item_type === 'category') {
          const category = categories?.find(c => c.id === orderItem.item_id);
          if (category) {
            return {
              id: category.id,
              name: category.name,
              type: 'category' as const,
              url: `/category/${category.id}`
            };
          }
        } else if (orderItem.item_type === 'subcategory') {
          const subcategory = subcategories?.find(s => s.id === orderItem.item_id);
          if (subcategory) {
            return {
              id: subcategory.id,
              name: subcategory.name,
              type: 'subcategory' as const,
              url: `/category/${subcategory.category_id}/${subcategory.id}`
            };
          }
        }
        return null;
      }).filter(Boolean) as MenuItem[];
    } else {
      // If no menu order exists, create a default flat structure
      // First add all categories
      categories?.forEach(category => {
        menuItems.push({
          id: category.id,
          name: category.name,
          type: 'category' as const,
          url: `/category/${category.id}`
        });
      });
      
      // Then add all subcategories
      subcategories?.forEach(subcategory => {
        menuItems.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory' as const,
          url: `/category/${subcategory.category_id}/${subcategory.id}`
        });
      });
    }

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}