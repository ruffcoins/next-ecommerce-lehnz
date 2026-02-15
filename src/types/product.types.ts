// MongoDB Product Types
export type ProductVariation = {
  article_id: number;
  color_name: string;
  pattern: string;
  price: number;
};

export type Discount = {
  amount: number;
  percentage: number;
};

// MongoDB Product Schema
export type MongoProduct = {
  _id: string;
  product_name: string;
  description: string;
  primary_category: string;
  secondary_category: string;
  product_type: string;
  department: string;
  variations: ProductVariation[];
  available_colors: string[];
  product_code: number;
};

// UI Product Type (for compatibility with existing components)
export type Product = {
  id: string;
  title: string;
  srcUrl: string;
  gallery?: string[];
  discount: Discount;
  rating: number;
  // Additional fields from MongoDB
  description?: string;
  category?: string;
  department?: string;
  variations?: ProductVariation[];
  available_colors?: string[];
  product_code?: number;
};

// Helper to generate image URL from article_id
export const getImageUrl = (articleId: number): string => {
  return `${process.env.NEXT_PUBLIC_IMAGES_URL}/${articleId}`;
};
