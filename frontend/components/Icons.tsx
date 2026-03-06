import { ComponentType, ReactNode } from 'react';
import type { ProjectIconId } from '../utils/projectsData';

type IconProps = {
  w?: number | string;
  h?: number | string;
};

function BaseIcon({ w, h, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w ?? 64}
      height={h ?? 64}
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

export function StarIcon({ w = 24, h = 24 }: IconProps) {
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

export function WatchIcon({ w = 24, h = 24 }: IconProps) {
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

export function BugIcon({ w = 24, h = 24 }: IconProps) {
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

export function AzureIcon({ w = 24, h = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      fill="none"
      viewBox="0 0 24 20"
    >
      <path
        fill="#fff"
        d="M13.113 0L6.037 6.15 0 17.016h5.444L13.113 0zm.94 1.44L11.035 9.97l5.79 7.292-11.232 1.935H24L14.054 1.44z"
      />
    </svg>
  );
}

export function GithubIcon({ w = 24, h = 24 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#fff"
        d="M24 12c0-3.313-1.172-6.14-3.516-8.484C18.141 1.172 15.312 0 12 0 8.688 0 5.86 1.172 3.516 3.516 1.172 5.859 0 8.687 0 12c0 3.313 1.172 6.14 3.516 8.484C5.859 22.828 8.687 24 12 24c3.313 0 6.14-1.172 8.484-3.516C22.828 18.141 24 15.312 24 12z"
      />
    </svg>
  );
}

export const projectIcons: Record<ProjectIconId, ComponentType<IconProps>> = {
  react: ReactIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  next: NextIcon,
  nuxt: NuxtIcon,
  gatsby: GatsbyIcon,
};
