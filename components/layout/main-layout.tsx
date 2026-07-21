"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Users,
  X,
  Bookmark,
  FileText,
  Flag,
  MessageSquare,
  Sparkles,
  Heart,
  FileText as FileTextIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const publicLinks = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/communities", label: "Communities", icon: Users },
];

const sidebarLinks: Record<UserRole, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  seeker: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications", label: "Applications", icon: FileText },
    { href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
    { href: "/profile", label: "Profile", icon: User },
  ],
  employer: [
    { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/employer/candidates", label: "Candidates", icon: Users },
    { href: "/employer/company", label: "Company", icon: Building2 },
    { href: "/employer/communities", label: "My Communities", icon: Users },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/applications", label: "Applications", icon: FileTextIcon },
    { href: "/admin/posts", label: "Posts", icon: MessageSquare },
    { href: "/admin/skills", label: "Skills", icon: Sparkles },
    { href: "/admin/interests", label: "Interests", icon: Heart },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/profile", label: "Profile", icon: User },
  ],
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Briefcase;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[color-mix(in_srgb,var(--brand-blue)_14%,transparent)] text-heading shadow-sm ring-1 ring-[color-mix(in_srgb,var(--brand-blue)_20%,transparent)]"
          : "text-subtle hover:bg-surface-muted hover:text-heading",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300">
      <div className="brand-gradient-line" />
      <div
        className="border-b border-default backdrop-blur-xl transition-colors duration-300 dark:border-white/5"
        style={{ backgroundColor: "var(--navbar-bg)" }}
      >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo size="sm" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {publicLinks.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <Link
                href={user.role === "employer" ? "/employer/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-subtle transition-colors hover:text-heading sm:inline-flex"
              >
                <User className="h-4 w-4" />
                {user.full_name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-subtle transition-colors hover:text-heading sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-subtle transition-colors hover:text-heading sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl brand-gradient glow-btn px-4 py-2 text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-default bg-surface-card text-subtle md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-default px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={pathname === link.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            {!isAuthenticated && (
              <NavLink href="/auth/login" label="Sign in" icon={User} onClick={() => setMobileOpen(false)} />
            )}
          </div>
        </nav>
      )}
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-default"
      style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-text)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo size="sm" href="/" />
            <p className="max-w-xs text-sm opacity-80">
              Connect talent with opportunity. Discover jobs, companies, and communities on HireHub.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-white">Explore</h3>
            <ul className="space-y-2 text-sm opacity-80">
              {publicLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-opacity hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-white">For employers</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/auth/register?role=employer" className="transition-opacity hover:opacity-100">Post a job</Link></li>
              <li><Link href="/employer/dashboard" className="transition-opacity hover:opacity-100">Employer dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold text-white">Account</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/auth/login" className="transition-opacity hover:opacity-100">Sign in</Link></li>
              <li><Link href="/auth/register" className="transition-opacity hover:opacity-100">Create account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-6">
          <div className="brand-gradient-line w-24 opacity-50" />
          <p className="text-center text-sm opacity-60">
            &copy; {year} HireHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface SidebarRoleProps extends SidebarProps {
  role?: UserRole;
}

export function Sidebar({ collapsed = false, onToggle, role }: SidebarRoleProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const portalRole = role ?? user?.role;
  if (!portalRole) return null;

  const links = sidebarLinks[portalRole] ?? sidebarLinks.seeker;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-default transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      <div className="flex h-14 items-center justify-between border-b border-default px-3">
        {!collapsed && (
          <span className="truncate px-2 text-xs font-semibold uppercase tracking-wider text-subtle">
            {portalRole} portal
          </span>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-muted hover:text-heading"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Portal">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "brand-gradient glow-btn text-white shadow-md"
                  : "text-subtle hover:bg-surface-muted hover:text-heading",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

interface PortalLayoutProps {
  children: ReactNode;
  role?: UserRole;
}

export function PortalLayout({ children, role }: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-surface-muted dark:bg-transparent">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

interface MainLayoutProps {
  children: ReactNode;
  withPortal?: boolean;
}

export function MainLayout({ children, withPortal = false }: MainLayoutProps) {
  if (withPortal) {
    return <PortalLayout>{children}</PortalLayout>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
