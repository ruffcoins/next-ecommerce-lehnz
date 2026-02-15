import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts, getItemRecommendations } from "@/app/actions/product-actions";

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const productId = params.slug[0];

  // Fetch the specific product from MongoDB
  const productData = await getProductById(productId);

  if (!productData) {
    notFound();
  }

  // Fetch related products using item-based recommendations
  let relatedProductData = await getItemRecommendations(productId, 1, 4);

  // Fallback to category/department based related products if recommendation engine returns nothing
  if (relatedProductData.length === 0) {
    relatedProductData = await getRelatedProducts(
      productId,
      productData.category,
      productData.department,
      4
    );
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={relatedProductData} />
      </div>
    </main>
  );
}
