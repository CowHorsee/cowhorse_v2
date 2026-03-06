export type ProjectKey = 'react' | 'vue' | 'svelte' | 'next' | 'nuxt' | 'gatsby';

export type ProjectData = {
  id: ProjectKey;
  name: string;
  path: string;
  slug: string;
  open_issues?: number;
  subscribers_count?: number;
  stargazers_count?: number;
  description?: string;
  html_url?: string;
};

export const projects: ProjectData[] = [
  {
    id: 'react',
    name: 'React',
    path: 'facebook/react',
    slug: 'facebook-react',
  },
  { id: 'vue', name: 'Vue', path: 'vuejs/vue', slug: 'vuejs-vue' },
  {
    id: 'svelte',
    name: 'Svelte',
    path: 'sveltejs/svelte',
    slug: 'sveltejs-svelte',
  },
  { id: 'next', name: 'Next.js', path: 'zeit/next.js', slug: 'zeit-nextjs' },
  { id: 'nuxt', name: 'Nuxt.js', path: 'nuxt/nuxt.js', slug: 'nuxt-nuxtjs' },
  {
    id: 'gatsby',
    name: 'Gatsby',
    path: 'gatsbyjs/gatsby',
    slug: 'gatsbyjs-gatsby',
  },
];
