export function fmtTk(n: number | undefined | null): string {
  return '৳' + (n ?? 0).toLocaleString('en-IN');
}

export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d: string | Date): string {
  return new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export function relTime(d: string | Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function imgUrl(path: string): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000'}${path}`;
}

// True for GIFs — Next/Image optimization strips animation, so set `unoptimized`.
export function isAnimatedImage(url: string): boolean {
  if (!url) return false;
  return /\.gif(\?.*)?$/i.test(url);
}

export function cls(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
