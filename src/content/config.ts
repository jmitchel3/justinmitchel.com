import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    category: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const collections = {
  posts,
};
