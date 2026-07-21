"use client";

import type { ReactNode } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalLayout role="admin">{children}</PortalLayout>
    </AuthenticatedRoute>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-subtle mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_6%,transparent)]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-subtle"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default">{children}</tbody>
        </table>
      </div>
      {empty}
    </div>
  );
}

export function AdminTableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      className={onClick ? "cursor-pointer transition-colors hover:bg-surface-muted" : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-heading ${className ?? ""}`}>{children}</td>
  );
}
