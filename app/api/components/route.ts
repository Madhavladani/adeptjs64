import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        component_categories(category_id, categories(*)),
        component_subcategories(subcategory_id, subcategories(*))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include categories and subcategories as arrays
    const transformedData = data.map(component => {
      const categories = component.component_categories?.map((cc: any) => cc.categories) || [];
      const subcategories = component.component_subcategories?.map((cs: any) => cs.subcategories) || [];
      
      return {
        ...component,
        categories,
        subcategories,
        component_categories: undefined,
        component_subcategories: undefined
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      image_url, 
      is_public, 
      is_pro, 
      figma_code, 
      framer_code, 
      webflow_code,
      category_ids, // Array of category IDs
      subcategory_ids // Array of subcategory IDs
    } = body;

    // Validate required fields
    if (!name || !description || !image_url) {
      return NextResponse.json(
        { error: 'Name, description and image URL are required' },
        { status: 400 }
      );
    }

    // Insert component
    const { data: component, error: componentError } = await supabase
      .from('components')
      .insert([{
        name,
        description,
        image_url,
        is_public: is_public ?? true,
        is_pro: is_pro ?? false,
        figma_code: figma_code || null,
        framer_code: framer_code || null,
        webflow_code: webflow_code || null,
      }])
      .select('id')
      .single();

    if (componentError) {
      return NextResponse.json(
        { error: componentError.message },
        { status: 500 }
      );
    }

    const componentId = component.id;
    
    // Insert category relationships
    if (category_ids && category_ids.length > 0) {
      const categoryRelations = category_ids.map((categoryId: string) => ({
        component_id: componentId,
        category_id: categoryId,
      }));
      
      const { error: categoryRelationError } = await supabase
        .from('component_categories')
        .insert(categoryRelations);
        
      if (categoryRelationError) {
        // If there's an error, attempt to clean up by deleting the component
        await supabase.from('components').delete().eq('id', componentId);
        
        return NextResponse.json(
          { error: categoryRelationError.message },
          { status: 500 }
        );
      }
    }
    
    // Insert subcategory relationships
    if (subcategory_ids && subcategory_ids.length > 0) {
      const subcategoryRelations = subcategory_ids.map((subcategoryId: string) => ({
        component_id: componentId,
        subcategory_id: subcategoryId,
      }));
      
      const { error: subcategoryRelationError } = await supabase
        .from('component_subcategories')
        .insert(subcategoryRelations);
        
      if (subcategoryRelationError) {
        // If there's an error, attempt to clean up by deleting the component and category relations
        await supabase.from('component_categories').delete().eq('component_id', componentId);
        await supabase.from('components').delete().eq('id', componentId);
        
        return NextResponse.json(
          { error: subcategoryRelationError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Component created successfully',
      component_id: componentId
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}