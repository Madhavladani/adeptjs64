import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import probe from 'probe-image-size';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getImageDimensions(url: string) {
  try {
    const result = await probe(url);
    return {
      width: result.width,
      height: result.height,
      type: result.type,
      mime: result.mime
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // First verify the category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If subcategoryId is provided, verify it exists and belongs to the category
    if (subcategoryId) {
      const { data: subcategory, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('id', subcategoryId)
        .eq('category_id', categoryId)
        .single();

      if (subcategoryError || !subcategory) {
        return NextResponse.json(
          { error: 'Subcategory not found or does not belong to the specified category' },
          { status: 404 }
        );
      }
    }

    // Fetch components with their relationships
    let query = supabase
      .from('components')
      .select(`
        *,
        component_categories!inner(*),
        component_subcategories!inner(*)
      `)
      .eq('component_categories.category_id', categoryId);

    if (subcategoryId) {
      query = query.eq('component_subcategories.subcategory_id', subcategoryId);
    }

    const { data: components, error: componentsError } = await query;

    if (componentsError) {
      throw componentsError;
    }

    // Get image dimensions for each component
    const componentsWithDimensions = await Promise.all(
      (components || []).map(async (component) => {
        const dimensions = await getImageDimensions(component.image_url);
        return {
          ...component,
          dimensions: dimensions || {
            width: 400,
            height: 300
          }
        };
      })
    );

    return NextResponse.json({
      category,
      subcategory: subcategoryId ? await supabase
        .from('subcategories')
        .select('*')
        .eq('id', subcategoryId)
        .single()
        .then(({ data }) => data) : null,
      components: componentsWithDimensions
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}