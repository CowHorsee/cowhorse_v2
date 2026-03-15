import type { AuthUser, UserRole } from './api/authApi';
import { USER_ROLES, USER_ROLE_VALUES } from './constants';

type RouteMatchMode = 'exact' | 'prefix';

export type AppRouteConfig = {
  href: string;
  label: string;
  iconPath?: string;
  allowedRoles: UserRole[];
  showInSidebar?: boolean;
  matchMode?: RouteMatchMode;
};

const ALL_ROLES: UserRole[] = USER_ROLE_VALUES;

/** Central RBAC config for navigation and route access. */
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
    href: '/approval',
    label: 'PR Approvals',
    iconPath: '/clipboard-text.svg',
    allowedRoles: [USER_ROLES.MANAGER],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/pr/approval',
    label: 'PR Approvals Legacy',
    allowedRoles: [USER_ROLES.MANAGER],
    showInSidebar: false,
    matchMode: 'prefix',
  },
  {
    href: '/pr/[id]',
    label: 'PR Details',
    allowedRoles: [USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER],
    showInSidebar: false,
    matchMode: 'exact',
  },
  {
    href: '/pr',
    label: 'Purchase Requests',
    iconPath: '/clipboard-text.svg',
    allowedRoles: [USER_ROLES.EMPLOYEE],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    iconPath: '/box.svg',
    allowedRoles: [USER_ROLES.WAREHOUSE],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/users',
    label: 'Users',
    iconPath: '/user.svg',
    allowedRoles: [USER_ROLES.ADMIN],
    showInSidebar: true,
    matchMode: 'prefix',
  },
  {
    href: '/register',
    label: 'Create User',
    allowedRoles: [USER_ROLES.ADMIN],
    showInSidebar: false,
    matchMode: 'exact',
  },
  {
    href: '/profile',
    label: 'Profile',
    allowedRoles: ALL_ROLES,
    showInSidebar: false,
    matchMode: 'exact',
  },
];

export function hasRouteAccess(
  role: UserRole | null | undefined,
  routeConfig: AppRouteConfig,
) {
  return Boolean(role && routeConfig.allowedRoles.includes(role));
}

export function getSidebarTabsForUser(user: AuthUser | null) {
  return appRouteConfig.filter(
    (routeConfig) =>
      routeConfig.showInSidebar !== false &&
      hasRouteAccess(user?.role, routeConfig),
  );
}

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

export function getDefaultRouteForUser(user: AuthUser | null) {
  const firstSidebarTab = getSidebarTabsForUser(user)[0];
  if (firstSidebarTab) {
    return firstSidebarTab.href;
  }

  const firstAllowedRoute = appRouteConfig.find((routeConfig) =>
    hasRouteAccess(user?.role, routeConfig),
  );

  return firstAllowedRoute?.href || '/login';
}
