import { ComponentType, ReactNode } from 'react';
import { ProjectKey } from '../utils/projectsData';

type IconProps = {
  w: number;
  h: number;
};

function BaseIcon({ w, h, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 64 64"
      fill="none"
    >
      {children}
    </svg>
  );
}

export function ReactIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <circle cx="32" cy="32" r="6" fill="#61DAFB" />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="10"
        stroke="#61DAFB"
        strokeWidth="3"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="10"
        stroke="#61DAFB"
        strokeWidth="3"
        transform="rotate(60 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="10"
        stroke="#61DAFB"
        strokeWidth="3"
        transform="rotate(120 32 32)"
      />
    </BaseIcon>
  );
}

export function VueIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <path d="M8 10h16l8 14 8-14h16L32 54 8 10z" fill="#41B883" />
      <path d="M20 10h10l2 4 2-4h10L32 34 20 10z" fill="#35495E" />
    </BaseIcon>
  );
}

export function SvelteIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <path
        d="M42 10c8 0 14 5 14 12 0 5-2 8-7 11l-15 8c-2 1-3 2-3 3 0 2 2 3 4 3 3 0 5-1 7-3l7 7c-3 3-8 5-14 5-10 0-16-6-16-13 0-6 3-9 9-12l13-7c2-1 3-2 3-3 0-2-2-3-4-3-3 0-4 1-6 2l-7-7c3-2 8-3 15-3z"
        fill="#FF3E00"
      />
    </BaseIcon>
  );
}

export function NextIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <circle cx="32" cy="32" r="26" fill="#111827" />
      <path d="M20 43V21h4l16 17V21h4v22h-4L24 26v17h-4z" fill="#FFFFFF" />
    </BaseIcon>
  );
}

export function NuxtIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <path d="M10 46l14-24 8 14 8-14 14 24H10z" fill="#00DC82" />
      <path d="M24 46l8-14 8 14H24z" fill="#169B62" />
    </BaseIcon>
  );
}

export function GatsbyIcon({ w, h }: IconProps) {
  return (
    <BaseIcon w={w} h={h}>
      <circle cx="32" cy="32" r="24" fill="#663399" />
      <path
        d="M32 18c8 0 14 6 14 14h-7c0-4-3-7-7-7-3 0-5 2-5 5 0 2 1 4 4 5l5 2c5 2 8 6 8 12 0 8-6 13-14 13-9 0-15-6-15-14h7c0 4 3 7 8 7 3 0 6-2 6-5 0-2-1-4-4-5l-5-2c-5-2-8-6-8-12 0-7 6-13 13-13z"
        fill="#FFFFFF"
      />
    </BaseIcon>
  );
}

export function StarIcon({ w, h }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 2l2.9 5.88 6.5.95-4.7 4.59 1.1 6.48L12 16.9l-5.8 3.05 1.1-6.48-4.7-4.59 6.5-.95L12 2z"
        fill="#3498DB"
      />
    </svg>
  );
}

export function WatchIcon({ w, h }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 5C6.5 5 2.1 10 1 12c1.1 2 5.5 7 11 7s9.9-5 11-7c-1.1-2-5.5-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z"
        fill="#3498DB"
      />
    </svg>
  );
}

export function BugIcon({ w, h }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M17 8h4v2h-2v2h2v2h-2a7 7 0 01-14 0H3v-2h2v-2H3V8h4V6a5 5 0 0110 0v2zm-2 6V6a3 3 0 00-6 0v8a3 3 0 006 0z"
        fill="#E74C3C"
      />
    </svg>
  );
}

export function GithubIcon({ w, h }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 2a10 10 0 00-3.16 19.5c.5.1.68-.22.68-.49v-1.9c-2.78.6-3.37-1.34-3.37-1.34-.45-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.61.07-.61 1.01.08 1.55 1.06 1.55 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.13-4.56-5.02 0-1.11.39-2.01 1.03-2.72-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.04A9.34 9.34 0 0112 6.8c.85 0 1.71.11 2.51.34 1.91-1.31 2.74-1.04 2.74-1.04.56 1.43.21 2.48.11 2.74.64.71 1.03 1.61 1.03 2.72 0 3.9-2.35 4.76-4.59 5.01.36.32.68.95.68 1.92v2.85c0 .27.18.6.69.49A10 10 0 0012 2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export const projectIcons: Record<ProjectKey, ComponentType<IconProps>> = {
  react: ReactIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  next: NextIcon,
  nuxt: NuxtIcon,
  gatsby: GatsbyIcon,
};
