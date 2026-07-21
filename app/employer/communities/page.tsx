"use client";

import { AuthenticatedRoute } from "@/components/auth-guard";
import { MyCommunitiesView } from "@/components/communities/my-communities-view";
import { PortalLayout } from "@/components/layout/main-layout";

export default function EmployerCommunitiesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <MyCommunitiesView />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
