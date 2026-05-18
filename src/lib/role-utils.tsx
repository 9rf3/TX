import { useAuth } from "@/components/providers/AuthProvider";
import { UserRole } from "./types";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export const ROLES = {
  STUDENT: 'student' as UserRole,
  TEACHER: 'teacher' as UserRole,
  ADMIN: 'admin' as UserRole,
};

export function isStudent(role?: UserRole): boolean {
  return role === ROLES.STUDENT;
}

export function isTeacher(role?: UserRole): boolean {
  return role === ROLES.TEACHER;
}

export function isAdmin(role?: UserRole): boolean {
  return role === ROLES.ADMIN;
}

interface HasRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that only renders its children if the current user has one of the required roles.
 */
export function HasRole({ roles, children, fallback = null }: HasRoleProps) {
  const { profile, isLoading } = useAuth();

  if (isLoading) return null;

  if (profile && roles.includes(profile.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * A hook that redirects if the user does not have the required roles.
 */
export function useRequireRole(roles: UserRole[], redirectTo: string = "/dashboard") {
  const { profile, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (profile && roles.includes(profile.role)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        redirect(redirectTo);
      }
    }
  }, [profile, isLoading, roles, redirectTo]);

  return { isAuthorized, isLoading };
}
