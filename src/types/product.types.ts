// MongoDB Product Types
export type ProductVariation = {
  article_id: string;
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
  product_code: string;
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
  product_code?: string;
};

// Helper to generate image URL from article_id
export const getImageUrl = (articleId: string): string => {
  return `http://192.168.0.103:8000/images/${articleId}`;
};
