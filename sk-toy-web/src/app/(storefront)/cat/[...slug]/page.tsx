import { redirect } from 'next/navigation';

export default async function CatRedirect({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [first, second] = slug;

  // /cat/age/0-2 → /products?ageGroup=age-0-2
  if (first === 'age' && second) {
    redirect(`/products?ageGroup=age-${second}`);
  }

  // /cat/gender/boys → /products?gender=boys
  if (first === 'gender' && second) {
    redirect(`/products?gender=${second}`);
  }

  // /cat/[main]/[sub] → /categories/[sub] (attempt deep slug first)
  if (second) {
    redirect(`/categories/${second}`);
  }

  // /cat/[main] → /categories/[main]
  redirect(`/categories/${first}`);
}
