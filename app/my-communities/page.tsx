"use client";

import { AuthenticatedRoute } from "@/components/auth-guard";
import { MyCommunitiesView } from "@/components/communities/my-communities-view";
import { PortalLayout } from "@/components/layout/main-layout";

export default function MyCommunitiesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker", "employer"]}>
      <PortalLayout>
        <MyCommunitiesView />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
