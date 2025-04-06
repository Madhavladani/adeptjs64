import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search for components where name contains the query string
    // Using ilike for case-insensitive search
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        component_categories(category_id, categories(*)),
        component_subcategories(subcategory_id, subcategories(*))
      `)
      .ilike('name', `%${query}%`)
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
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 