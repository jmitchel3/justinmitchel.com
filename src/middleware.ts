import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  // Redirect .md file extensions to clean URLs
  if (url.pathname.endsWith('.md')) {
    const cleanPath = url.pathname.slice(0, -3);
    return redirect(cleanPath, 301);
  }

  return next();
});
