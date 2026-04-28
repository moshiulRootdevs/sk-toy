'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { imgUrl, fmtDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blog-post', slug],
    queryFn: () => api.get(`/blog/${slug}`).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!post) return <div className="text-center py-32 text-gray-400">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/blog" className="text-sm text-[#EC5D4A] hover:underline flex items-center gap-1 mb-6">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Blog
      </Link>

      {post.coverImage && (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
          <Image src={imgUrl(post.coverImage)} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {post.category && (
        <span className="text-xs font-semibold text-[#EC5D4A] uppercase">{post.category}</span>
      )}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-3">{post.title}</h1>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-8">
        {post.author && <span>By {post.author}</span>}
        {post.publishedAt && <span>{fmtDate(post.publishedAt)}</span>}
        {post.readTime && <span>{post.readTime} min read</span>}
      </div>

      {post.body && (
        <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.body}
        </div>
      )}
    </div>
  );
}
