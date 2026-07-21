"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardPath } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading";
import type { UserRole } from "@/types";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

function useRouteGuard({
  children,
  requireAuth,
  allowedRoles,
  guestOnly,
  redirectTo,
}: {
  children: ReactNode;
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  guestOnly?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (guestOnly && isAuthenticated && user) {
      router.replace(redirectTo ?? getDashboardPath(user.role));
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo ?? "/auth/login");
      return;
    }

    if (
      requireAuth &&
      isAuthenticated &&
      user &&
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      router.replace(getDashboardPath(user.role));
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    guestOnly,
    allowedRoles,
    redirectTo,
    router,
  ]);

  if (isLoading) return <LoadingScreen />;
  if (guestOnly && isAuthenticated) return <LoadingScreen />;
  if (requireAuth && !isAuthenticated) return <LoadingScreen />;
  if (
    requireAuth &&
    user &&
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export function AuthenticatedRoute({
  children,
  allowedRoles,
  redirectTo,
}: RouteGuardProps) {
  return useRouteGuard({ children, requireAuth: true, allowedRoles, redirectTo });
}

export function GuestRoute({
  children,
  redirectTo,
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  return useRouteGuard({ children, requireAuth: false, guestOnly: true, redirectTo });
}

export default AuthenticatedRoute;
