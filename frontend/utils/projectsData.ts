export type ProjectIconId =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'next'
  | 'nuxt'
  | 'gatsby';

export type Project = {
  id: ProjectIconId;
  name: string;
  path: string;
  slug: string;
};

export type ProjectStats = {
  open_issues: number;
  subscribers_count: number;
  stargazers_count: number;
};

export type ProjectGithubFields = {
  description: string | null;
  html_url: string;
};

export type ProjectWithStats = Project & ProjectStats & ProjectGithubFields;

export const projects: Project[] = [
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
