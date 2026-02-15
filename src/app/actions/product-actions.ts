"use server";

/**
 * PRODUCT SERVER ACTIONS
 * 
 * Purpose: Server-side functions for fetching product data from MongoDB.
 * These actions run on the server and can be called from client or server components.
 * 
 * Architecture Role:
 * - Data Fetching Layer: Bridges database and UI components
 * - Server Actions: Leverages Next.js server actions for type-safe data fetching
 * - Data Transformation: Converts MongoDB documents to UI-friendly format
 * 
 * Used By: Homepage (page.tsx), Product Detail Page, Shop Page
 */

import dbConnect, { Product as ProductModel, IProduct } from "@/lib/db";
import { MongoProduct, Product, getImageUrl } from "@/types/product.types";

/**
 * Transform MongoDB product document to UI Product type
 * Generates image URLs from article_ids and sets default values
 */
function transformProduct(mongoProduct: IProduct): Product {
    // Get the first variation's article_id for the main image
    const mainImage = mongoProduct.variations[0]?.article_id
        ? getImageUrl(mongoProduct.variations[0].article_id)
        : "/images/placeholder.png";

    // Generate gallery from all variations
    const gallery = mongoProduct.variations.map(v => getImageUrl(v.article_id));

    // Variations
    const variations = mongoProduct.variations.map(v => ({
        article_id: v.article_id,
        color_name: v.color_name,
        pattern: v.pattern,
        price: Number(v.price.toFixed(2)),
    }));
    return {
        id: mongoProduct._id.toString(),
        title: mongoProduct.product_name,
        srcUrl: mainImage,
        gallery,
        discount: {
            amount: 0,
            percentage: 0,
        },
        rating: 4.5, // TODO: Add rating field or calculate from reviews
        description: mongoProduct.description,
        category: mongoProduct.primary_category,
        department: mongoProduct.department,
        variations,
        available_colors: mongoProduct.available_colors,
        product_code: mongoProduct.product_code,
    };
}

/**
 * Fetch all products from MongoDB
 * @returns Array of products transformed for UI display
 */
export async function getAllProducts(): Promise<Product[]> {
    try {
        await dbConnect();
        const products = await ProductModel.find({}).lean<IProduct[]>();
        return products.map(transformProduct);
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function getRecommendedProducts(
    userId: string,
    page: number = 1,
    limit: number = 12
): Promise<{ products: Product[]; total: number; totalPages: number }> {
    if (!userId) {
        return { products: [], total: 0, totalPages: 0 };
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL}/recommend?user_id=${userId}&tenant_id=${process.env.NEXT_PUBLIC_TENANT_ID}&page=${page}&limit=${limit}`);
        const data = await res.json();

        const idsToFetch = data.all_item_ids || [];

        const products = await getProductsByIds(idsToFetch);

        return {
            products,
            total: data.meta?.total_items || products.length,
            totalPages: data.meta?.total_pages || 1
        };
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        return { products: [], total: 0, totalPages: 0 };
    }
}

export async function getItemRecommendations(
    itemId: string,
    page: number = 1,
    limit: number = 4
): Promise<Product[]> {
    if (!itemId) {
        return [];
    }

    try {
        // Construct URL for item-based recommendations
        // Using "semantic" mode as requested
        const url = `${process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL}/item/${itemId}?page=${page}&limit=${limit}&mode=semantic&tenant_id=${process.env.NEXT_PUBLIC_TENANT_ID}`;

        const res = await fetch(url);
        const data = await res.json();

        const idsToFetch = data.all_item_ids || [];

        if (idsToFetch.length === 0) {
            return [];
        }

        const products = await getProductsByIds(idsToFetch);
        return products;
    } catch (error) {
        console.error("Error fetching item recommendations:", error);
        return [];
    }
}

/**
 * Fetch a single product by ID
 * @param id - MongoDB ObjectId or product_code
 * @returns Product or null if not found
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        await dbConnect();
        const product = await ProductModel.findById(id).lean<IProduct>();

        if (!product) {
            return null;
        }

        return transformProduct(product);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}

/**
 * Fetch multiple products by their IDs
 * @param ids - Array of MongoDB ObjectIds
 * @returns Array of found products
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
        await dbConnect();
        const products = await ProductModel.find({
            _id: { $in: ids }
        }).lean<IProduct[]>();

        // Sort the results to match the order of the input IDs (optional but good for maintaining recommendation rank)
        const productsMap = new Map(products.map(p => [p._id.toString(), p]));
        const orderedProducts = ids
            .map(id => productsMap.get(id))
            .filter((p): p is IProduct => !!p);

        return orderedProducts.map(transformProduct);
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}

/**
 * Fetch products by category
 * @param category - Primary category to filter by
 * @returns Array of products in the category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
    try {
        await dbConnect();
        const products = await ProductModel.find({
            primary_category: category
        }).lean<IProduct[]>();

        return products.map(transformProduct);
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        return [];
    }
}

/**
 * Fetch products by department
 * @param department - Department to filter by
 * @returns Array of products in the department
 */
export async function getProductsByDepartment(department: string): Promise<Product[]> {
    try {
        await dbConnect();
        const products = await ProductModel.find({
            department
        }).lean<IProduct[]>();

        return products.map(transformProduct);
    } catch (error) {
        console.error(`Error fetching products for department ${department}:`, error);
        return [];
    }
}

/**
 * Fetch related products based on category and department
 * Excludes the current product and prioritizes same category, then same department
 * @param productId - ID of the current product to exclude
 * @param category - Category to match
 * @param department - Department to match
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of related products
 */
export async function getRelatedProducts(
    productId: string,
    category?: string,
    department?: string,
    limit: number = 4
): Promise<Product[]> {
    try {
        await dbConnect();

        // Build query to find related products
        const query: any = {
            _id: { $ne: productId }, // Exclude current product
        };

        // Prioritize same category, fallback to same department
        if (category) {
            query.primary_category = category;
        } else if (department) {
            query.department = department;
        }

        let products = await ProductModel.find(query)
            .limit(limit)
            .lean<IProduct[]>();

        // If we don't have enough products, fetch from same department
        if (products.length < limit && category && department) {
            const additionalProducts = await ProductModel.find({
                _id: { $ne: productId },
                department,
                primary_category: { $ne: category },
            })
                .limit(limit - products.length)
                .lean<IProduct[]>();

            products = [...products, ...additionalProducts];
        }

        // If still not enough, just get any other products
        if (products.length < limit) {
            const additionalProducts = await ProductModel.find({
                _id: { $ne: productId },
            })
                .limit(limit - products.length)
                .lean<IProduct[]>();

            products = [...products, ...additionalProducts];
        }

        return products.map(transformProduct);
    } catch (error) {
        console.error(`Error fetching related products:`, error);
        return [];
    }
}

/**
 * Filter options for product queries
 */
export interface ProductFilters {
    category?: string;
    department?: string;
    colors?: string[];
    minPrice?: number;
    maxPrice?: number;
    productType?: string;
    searchQuery?: string;
}

/**
 * Fetch products with pagination and filters
 * @param page - Page number (1-indexed)
 * @param limit - Number of products per page (default: 9)
 * @param filters - Optional filters to apply
 * @returns Object with products array, total count, and filter metadata
 */
export async function getProductsPaginated(
    page: number = 1,
    limit: number = 9,
    filters: ProductFilters = {}
): Promise<{ products: Product[]; total: number; totalPages: number }> {
    try {
        await dbConnect();

        // Ensure page is at least 1
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;

        // Build MongoDB query from filters
        const query: any = {};

        // Add text search if search query is provided
        if (filters.searchQuery && filters.searchQuery.trim()) {
            query.$text = { $search: filters.searchQuery.trim() };
        }

        if (filters.category) {
            query.primary_category = filters.category;
        }

        if (filters.department) {
            query.department = filters.department;
        }

        if (filters.colors && filters.colors.length > 0) {
            // Match products that have at least one of the selected colors
            query.available_colors = { $in: filters.colors };
        }

        if (filters.productType) {
            query.product_type = filters.productType;
        }

        // Fetch products with pagination and filters
        const [products, total] = await Promise.all([
            ProductModel.find(query)
                .skip(skip)
                .limit(limit)
                .lean<IProduct[]>(),
            ProductModel.countDocuments(query)
        ]);

        // Apply price filter after transformation (since price is generated)
        let transformedProducts = products.map(transformProduct);

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            transformedProducts = transformedProducts.filter(product => {
                if (product.variations && filters.minPrice !== undefined && product?.variations[0].price < filters.minPrice) {
                    return false;
                }
                if (product.variations && filters.maxPrice !== undefined && product?.variations[0].price > filters.maxPrice) {
                    return false;
                }
                return true;
            });
        }

        const totalPages = Math.ceil(total / limit);

        return {
            products: transformedProducts,
            total,
            totalPages,
        };
    } catch (error) {
        console.error("Error fetching paginated products:", error);
        return {
            products: [],
            total: 0,
            totalPages: 0,
        };
    }
}

/**
 * Get unique categories from all products
 * @returns Array of unique category names
 */
export async function getUniqueCategories(): Promise<string[]> {
    try {
        await dbConnect();
        const categories = await ProductModel.distinct("primary_category");
        return categories.filter(Boolean).sort();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

/**
 * Get unique departments from all products
 * @returns Array of unique department names
 */
export async function getUniqueDepartments(): Promise<string[]> {
    try {
        await dbConnect();
        const departments = await ProductModel.distinct("department");
        return departments.filter(Boolean).sort();
    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}

/**
 * Get unique colors from all products
 * @returns Array of unique color names
 */
export async function getUniqueColors(): Promise<string[]> {
    try {
        await dbConnect();
        // Get all products and extract unique colors from available_colors arrays
        const products = await ProductModel.find({}, { available_colors: 1 }).lean();
        const allColors = products.flatMap(p => p.available_colors || []);
        const uniqueColors = Array.from(new Set(allColors)).filter(Boolean).sort();
        return uniqueColors;
    } catch (error) {
        console.error("Error fetching colors:", error);
        return [];
    }
}

/**
 * Get unique product types from all products
 * @returns Array of unique product type names
 */
export async function getUniqueProductTypes(): Promise<string[]> {
    try {
        await dbConnect();
        const types = await ProductModel.distinct("product_type");
        return types.filter(Boolean).sort();
    } catch (error) {
        console.error("Error fetching product types:", error);
        return [];
    }
}

/**
 * Get price range from all products
 * @returns Object with min and max prices
 */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
    try {
        await dbConnect();
        // Since prices are generated randomly, return a fixed range
        // In production, you'd calculate this from actual product prices
        return {
            min: 20,
            max: 200,
        };
    } catch (error) {
        console.error("Error fetching price range:", error);
        return { min: 0, max: 250 };
    }
}
