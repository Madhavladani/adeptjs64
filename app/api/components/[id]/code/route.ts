import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define types for code data
type CodeType = 'figma' | 'framer' | 'webflow';
interface ComponentCodeData {
  figma_code?: string | null;
  framer_code?: string | null;
  webflow_code?: string | null;
  [key: string]: any; // Index signature to allow dynamic access
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const componentId = params.id;
    const type = request.nextUrl.searchParams.get('type') as CodeType | null;

    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }

    if (!type || !['figma', 'framer', 'webflow'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid type (figma, framer, or webflow) is required' },
        { status: 400 }
      );
    }

    // Convert type to database column name
    const codeColumn = `${type}_code`;

    // Fetch only the specific code field from the database
    const { data, error } = await supabase
      .from('components')
      .select(codeColumn)
      .eq('id', componentId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    const typedData = data as ComponentCodeData;
    
    // Explicitly check if the data or code is null
    if (!typedData) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }
    
    if (typedData[codeColumn] === null || typedData[codeColumn] === undefined) {
      return NextResponse.json(
        { error: `No ${type} code found for this component` },
        { status: 404 }
      );
    }

    // Return the code data
    return NextResponse.json({
      code: typedData[codeColumn]
    });
  } catch (error) {
    console.error('Error fetching component code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 