'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { imgUrl, fmtDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const TINTS = ['#FFE0EC', '#FFEDB6', '#D7F5E2', '#D4EEF7', '#E5D9F8', '#FFE0CB'];

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.get('/blog').then((r) => r.data),
  });

  const posts: BlogPost[] = data?.posts || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">📔 The Journal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1F2F4A]">Toy Stories & Parenting Tips</h1>
        <p className="text-sm text-[#7A8299] mt-2 font-medium max-w-xl">Guides, gift ideas, and ideas for raising happy little ones.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-[#7A8299] font-semibold">No articles yet — check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group bg-white border-2 border-[#FFE0EC] rounded-[24px] overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all"
            >
              <div className="relative aspect-video" style={{ background: TINTS[i % TINTS.length] }}>
                {post.coverImage && (
                  <Image src={imgUrl(post.coverImage)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-5">
                {post.category && (
                  <span className="text-[10px] font-extrabold text-[#FF6FB1] uppercase tracking-[.14em]">{post.category}</span>
                )}
                <h2 className="mt-1.5 font-display font-bold text-[#1F2F4A] text-lg line-clamp-2 group-hover:text-[#FF6FB1] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-[#5A5048] mt-1.5 line-clamp-2 font-medium">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-[#7A8299] font-semibold">
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
