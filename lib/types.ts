export interface Component {
  id: string;
  name: string;
  description: string;
  image_url: string;
  dimensions?: {
    width: number;
    height: number;
    type?: string;
    mime?: string;
  };
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  svg_logo: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  svg_logo: string | null;
  image_url: string | null;
  category_id: string;
  created_at: string;
  category?: Category;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_public: boolean;
  is_pro: boolean;
  figma_code?: string | null;
  framer_code?: string | null;
  webflow_code?: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  subcategories?: Subcategory[];
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  country: string;
  city: string;
  mobile_number: string;
  account_type: number;
  created_at: string;
  updated_at: string;
}