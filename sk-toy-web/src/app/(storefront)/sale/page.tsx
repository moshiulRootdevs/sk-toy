import { redirect } from 'next/navigation';

// Alias /sale → /categories/sale (the virtual "Sale" category page)
export default function SalePage() {
  redirect('/categories/sale');
}
