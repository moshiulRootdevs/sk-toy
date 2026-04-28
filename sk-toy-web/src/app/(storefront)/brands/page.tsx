'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Brand } from '@/types';
import { imgUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function BrandsPage() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => api.get('/brands').then((r) => r.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shop by Brand</h1>
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(brands || []).map((brand) => (
            <Link
              key={brand._id}
              href={`/products?brand=${brand._id}`}
              className="group flex flex-col items-center gap-3 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-[#EC5D4A]/30 transition-all"
            >
              {brand.logo ? (
                <div className="w-16 h-12 relative">
                  <Image src={imgUrl(brand.logo)} alt={brand.name} fill className="object-contain" />
                </div>
              ) : (
                <span className="text-2xl font-extrabold text-gray-300 group-hover:text-[#EC5D4A] transition-colors">
                  {brand.em || brand.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#EC5D4A] text-center transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
