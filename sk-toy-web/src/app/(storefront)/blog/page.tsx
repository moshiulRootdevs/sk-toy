'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { imgUrl, fmtDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.get('/blog').then((r) => r.data),
  });

  const posts: BlogPost[] = data?.posts || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Toy Stories & Tips</h1>
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.coverImage && (
                <div className="relative aspect-video bg-gray-100">
                  <Image src={imgUrl(post.coverImage)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <span className="text-xs font-semibold text-[#EC5D4A] uppercase">{post.category}</span>
                )}
                <h2 className="mt-1 font-bold text-gray-900 text-base line-clamp-2 group-hover:text-[#EC5D4A] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  {post.author && <span>By {post.author}</span>}
                  {post.publishedAt && <span>{fmtDate(post.publishedAt)}</span>}
                  {post.readTime && <span>{post.readTime} min read</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
