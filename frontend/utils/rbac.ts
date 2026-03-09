import type { AuthUser, UserRole } from './authApi';

type RouteMatchMode = 'exact' | 'prefix';

export type AppRouteConfig = {
  href: string;
  label: string;
  iconPath?: string;
  allowedRoles: UserRole[];
  showInSidebar?: boolean;
  matchMode?: RouteMatchMode;
};

const ALL_ROLES: UserRole[] = ['ADMIN', 'EMPLOYEE', 'MANAGER'];

/**
 * Central RBAC config for navigation and route access.
 * Update `allowedRoles` here to add or remove sidebar tabs per role.
 */
export const appRouteConfig: AppRouteConfig[] = [
  {
    href: '/',
    label: 'Dashboard',
    iconPath: '/element-2.svg',
    allowedRoles: ALL_ROLES,
    showInSidebar: true,
    matchMode: 'exact',
  },
  {
    href: '/pr/approval',
    label: 'PR Approvals',
    iconPath: '/clipboard-text.svg',
    allowedRoles: ['MANAGER'],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/pr',
    label: 'Purchase Requests',
    iconPath: '/clipboard-text.svg',
    allowedRoles: ['ADMIN', 'EMPLOYEE'],
    showInSidebar: true,
    matchMode: 'prefix',
  },
    {
    href: '/inventory',
    label: 'Inventory',
    iconPath: '/box.svg',
    allowedRoles: ['', 'ADMIN'],
    showInSidebar: true,
    matchMode: 'prefix',
  },
    {
    href: '/users',
    label: 'Users',
    iconPath: '/user.svg',
    allowedRoles: [''],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/profile',
    label: 'Profile',
    allowedRoles: ALL_ROLES,
    showInSidebar: false,
    matchMode: 'exact',
  },
];

/** Returns true when the given role is allowed to use the route config entry. */
export function hasRouteAccess(
  role: UserRole | null | undefined,
  routeConfig: AppRouteConfig
) {
  return Boolean(role && routeConfig.allowedRoles.includes(role));
}

/** Returns sidebar-visible routes for the current user's role. */
export function getSidebarTabsForUser(user: AuthUser | null) {
  return appRouteConfig.filter(
    (routeConfig) =>
      routeConfig.showInSidebar !== false &&
      hasRouteAccess(user?.role, routeConfig)
  );
}

/** Returns true when the current user role can access the provided pathname. */
export function canAccessPath(pathname: string, user: AuthUser | null) {
  return appRouteConfig.some((routeConfig) => {
    if (!hasRouteAccess(user?.role, routeConfig)) {
      return false;
    }

    if (routeConfig.matchMode === 'prefix') {
      return pathname.startsWith(routeConfig.href);
    }

    return pathname === routeConfig.href;
  });
}

/** Returns the first accessible app route to use as an RBAC-safe redirect target. */
export function getDefaultRouteForUser(user: AuthUser | null) {
  const firstSidebarTab = getSidebarTabsForUser(user)[0];
  if (firstSidebarTab) {
    return firstSidebarTab.href;
  }

  const firstAllowedRoute = appRouteConfig.find((routeConfig) =>
    hasRouteAccess(user?.role, routeConfig)
  );

  return firstAllowedRoute?.href || '/login';
}
