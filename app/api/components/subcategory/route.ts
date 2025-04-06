import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
// @ts-ignore
import probe from 'probe-image-size';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getImageDimensions(url: string) {
  try {
    // Validate URL before attempting to probe
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('Invalid image URL:', url);
      return null;
    }

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Image probe timeout')), 5000);
    });
    
    const probePromise = probe(url);
    
    // Race between the probe and timeout
    const result = await Promise.race([probePromise, timeoutPromise]) as any;
    
    return {
      width: result.width,
      height: result.height,
      type: result.type,
      mime: result.mime
    };
  } catch (error) {
    console.error('Error getting image dimensions for URL:', url, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    console.log('Subcategory API endpoint called');
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId');
    console.log('Requested subcategoryId:', subcategoryId);

    if (!subcategoryId) {
      console.log('No subcategoryId provided');
      return NextResponse.json(
        { error: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    // First fetch the subcategory to get its data and related category
    console.log('Fetching subcategory data with ID:', subcategoryId);
    const { data: subcategory, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('*, category:categories(*)')
      .eq('id', subcategoryId)
      .single();

    if (subcategoryError || !subcategory) {
      console.error('Subcategory fetch error or not found:', subcategoryError);
      return NextResponse.json(
        { error: subcategoryError ? subcategoryError.message : 'Subcategory not found' },
        { status: 404 }
      );
    }

    console.log('Subcategory found:', subcategory?.name);

    // Fetch components that belong to this subcategory
    console.log('Fetching components for subcategory ID:', subcategoryId);
    
    // First get the junction table entries for this subcategory
    const { data: junctionEntries, error: junctionError } = await supabase
      .from('component_subcategories')
      .select('component_id')
      .eq('subcategory_id', subcategoryId);
      
    if (junctionError) {
      console.error('Junction table query error:', junctionError);
      return NextResponse.json(
        { error: junctionError.message },
        { status: 500 }
      );
    }
    
    if (!junctionEntries || junctionEntries.length === 0) {
      console.log('No components found for this subcategory');
      return NextResponse.json({
        category: subcategory.category,
        subcategory,
        components: []
      });
    }
    
    // Get the component IDs from the junction entries
    const componentIds = junctionEntries.map(entry => entry.component_id);
    console.log(`Found ${componentIds.length} component IDs in junction table`);
    
    // Now fetch the components using the IDs
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select(`
        *,
        component_categories(category_id, categories(*)),
        component_subcategories(subcategory_id, subcategories(*))
      `)
      .in('id', componentIds)
      .order('created_at', { ascending: false });

    if (componentsError) {
      console.error('Components fetch error:', componentsError);
      return NextResponse.json(
        { error: componentsError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${components?.length || 0} components`);

    // Transform the data to include categories and subcategories as arrays
    console.log('Transforming component data');
    const transformedComponents = await Promise.all(
      (components || []).map(async (component) => {
        const dimensions = await getImageDimensions(component.image_url);
        
        // Extract categories
        const categories = component.component_categories
          ? component.component_categories.map((cc: any) => cc.categories)
          : [];
        
        // Extract subcategories  
        const subcategories = component.component_subcategories
          ? component.component_subcategories.map((cs: any) => cs.subcategories)
          : [];
        
        return {
          ...component,
          dimensions: dimensions || { width: 400, height: 300 },
          categories,
          subcategories,
          component_categories: undefined,
          component_subcategories: undefined
        };
      })
    );

    console.log('Successfully processed data, returning response');
    return NextResponse.json({
      category: subcategory.category,
      subcategory,
      components: transformedComponents
    });
  } catch (error) {
    console.error('Error in subcategory API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components by subcategory' },
      { status: 500 }
    );
  }
} 