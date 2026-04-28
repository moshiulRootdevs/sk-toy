'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CmsPage } from '@/types';
import Spinner from '@/components/ui/Spinner';

export default function CmsPageView() {
  const { slug } = useParams();

  const { data: page, isLoading } = useQuery<CmsPage>({
    queryKey: ['cms-page', slug],
    queryFn: () => api.get(`/cms/slug/${slug}`).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!page) return <div className="text-center py-32 text-gray-400">Page not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">{page.title}</h1>
      <div className="space-y-5">
        {page.blocks.map((block, i) => {
          switch (block.type) {
            case 'heading':
              return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6">{block.text}</h2>;
            case 'paragraph':
              return <p key={i} className="text-gray-600 leading-relaxed">{block.text}</p>;
            case 'qa':
              return (
                <div key={i} className="border-l-4 border-[#EC5D4A] pl-4">
                  <p className="font-semibold text-gray-900">{block.q}</p>
                  <p className="text-gray-600 mt-1">{block.a}</p>
                </div>
              );
            case 'image':
              return block.src ? (
                <img key={i} src={block.src} alt="" className="rounded-xl w-full" />
              ) : null;
            case 'list':
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-gray-600">
                  {(block.items ?? []).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            case 'divider':
              return <hr key={i} className="border-gray-200" />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
