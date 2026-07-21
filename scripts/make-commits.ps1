$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$commits = @(
  @{ msg = "gitignore and env example added"; files = @(".gitignore", ".env.local.example") },
  @{ msg = "package dependencies configured"; files = @("package.json", "package-lock.json") },
  @{ msg = "typescript and eslint config added"; files = @("tsconfig.json", "eslint.config.mjs", "postcss.config.mjs", "next.config.ts") },
  @{ msg = "shared types index created"; files = @("types/index.ts") },
  @{ msg = "lib utils and constants added"; files = @("lib/utils.ts", "lib/constants.ts") },
  @{ msg = "lib theme and download helpers added"; files = @("lib/theme.ts", "lib/download.ts") },
  @{ msg = "api client with auth token handling added"; files = @("lib/api-client.ts") },
  @{ msg = "post avatar and community lib helpers added"; files = @("lib/post-utils.ts", "lib/avatar-utils.ts", "lib/community-membership.ts") },
  @{ msg = "public logo assets added"; files = @("public/hirehub-logo-dark.png", "public/hirehub-logo-full.png", "public/hirehub-logo-light.png", "public/logo-full.png", "public/logo.png") },
  @{ msg = "global styles and app shell layout added"; files = @("app/globals.css", "app/layout.tsx", "app/icon.png", "app/page.tsx") },
  @{ msg = "ui button input and card components added"; files = @("components/ui/button.tsx", "components/ui/input.tsx", "components/ui/card.tsx") },
  @{ msg = "ui form modal and loading components added"; files = @("components/ui/form.tsx", "components/ui/modal.tsx", "components/ui/loading.tsx") },
  @{ msg = "ui shared and skeleton components added"; files = @("components/ui/shared.tsx", "components/ui/skeleton.tsx") },
  @{ msg = "theme provider and toggle components added"; files = @("components/theme/theme-init.tsx", "components/theme/theme-provider.tsx", "components/theme/theme-toggle.tsx") },
  @{ msg = "layout brand logo and mesh background added"; files = @("components/layout/brand-logo.tsx", "components/layout/mesh-background.tsx", "components/layout/auth-layout.tsx") },
  @{ msg = "main layout navbar and sidebar added"; files = @("components/layout/main-layout.tsx") },
  @{ msg = "auth guard and empty state components added"; files = @("components/auth-guard.tsx", "components/empty-state.tsx") },
  @{ msg = "auth and theme providers added"; files = @("providers/auth-provider.tsx", "providers/theme-provider.tsx") },
  @{ msg = "auth service added"; files = @("services/auth.ts") },
  @{ msg = "catalog and users services added"; files = @("services/catalog.ts", "services/users.ts") },
  @{ msg = "jobs and applications services added"; files = @("services/jobs.ts", "services/applications.ts") },
  @{ msg = "companies and dashboard services added"; files = @("services/companies.ts", "services/dashboard.ts") },
  @{ msg = "posts service added"; files = @("services/posts.ts") },
  @{ msg = "social service added"; files = @("services/social.ts") },
  @{ msg = "analytics reports and skills services added"; files = @("services/analytics.ts", "services/reports.ts", "services/user-skills.ts") },
  @{ msg = "page states component added"; files = @("app/_components/page-states.tsx") },
  @{ msg = "auth login and register pages added"; files = @("app/auth/login/page.tsx", "app/auth/register/page.tsx") },
  @{ msg = "jobs browse and detail pages added"; files = @("app/jobs/page.tsx", "app/jobs/[id]/page.tsx") },
  @{ msg = "companies browse and detail pages added"; files = @("app/companies/page.tsx", "app/companies/[id]/page.tsx") },
  @{ msg = "community feed pages added"; files = @("app/community/page.tsx", "app/community/[id]/page.tsx", "app/community/new/page.tsx") },
  @{ msg = "communities browse and detail pages added"; files = @("app/communities/page.tsx", "app/communities/[id]/page.tsx") },
  @{ msg = "post card and image components added"; files = @("components/post-card.tsx", "components/post-image-dropzone.tsx", "components/community/new-post-dialog.tsx") },
  @{ msg = "entity avatar and image upload added"; files = @("components/entity-avatar.tsx", "components/image-upload.tsx") },
  @{ msg = "job company and user cards added"; files = @("components/cards/index.tsx") },
  @{ msg = "search resume export import components added"; files = @("components/search/search-bar.tsx", "components/resume-upload.tsx", "components/export-button.tsx", "components/import-dialog.tsx", "components/status-history-timeline.tsx", "components/user-skill-badge.tsx") },
  @{ msg = "seeker dashboard page added"; files = @("app/dashboard/page.tsx") },
  @{ msg = "seeker profile and applications pages added"; files = @("app/profile/page.tsx", "app/applications/page.tsx", "app/applications/[id]/page.tsx") },
  @{ msg = "saved jobs and notifications pages added"; files = @("app/saved-jobs/page.tsx", "app/notifications/page.tsx") },
  @{ msg = "my skills and interests pages added"; files = @("app/my/skills/page.tsx", "app/my/skills/new/page.tsx", "app/my/interests/page.tsx") },
  @{ msg = "mentorship and messages pages added"; files = @("app/mentorship/page.tsx", "app/messages/page.tsx", "app/messages/[id]/page.tsx") },
  @{ msg = "employer page header and job form added"; files = @("app/employer/_components/page-header.tsx", "app/employer/_components/job-form.tsx") },
  @{ msg = "employer dashboard and company pages added"; files = @("app/employer/dashboard/page.tsx", "app/employer/company/page.tsx") },
  @{ msg = "employer jobs list and detail pages added"; files = @("app/employer/jobs/page.tsx", "app/employer/jobs/[id]/page.tsx") },
  @{ msg = "employer job create and edit pages added"; files = @("app/employer/jobs/new/page.tsx", "app/employer/jobs/[id]/edit/page.tsx") },
  @{ msg = "employer applicants page added"; files = @("app/employer/jobs/[id]/applicants/page.tsx") },
  @{ msg = "employer candidates pages added"; files = @("app/employer/candidates/page.tsx", "app/employer/candidates/[id]/page.tsx") },
  @{ msg = "employer my communities page added"; files = @("app/employer/communities/page.tsx") },
  @{ msg = "admin shell and index page added"; files = @("app/admin/_components/admin-shell.tsx", "app/admin/page.tsx") },
  @{ msg = "admin dashboard and analytics added"; files = @("app/admin/dashboard/page.tsx", "app/admin/dashboard/_components/analytics-charts.tsx") },
  @{ msg = "admin users pages added"; files = @("app/admin/users/page.tsx", "app/admin/users/new/page.tsx", "app/admin/users/[id]/page.tsx", "app/admin/users/[id]/edit/page.tsx") },
  @{ msg = "admin companies pages added"; files = @("app/admin/companies/page.tsx", "app/admin/companies/[id]/page.tsx", "app/admin/companies/[id]/edit/page.tsx") },
  @{ msg = "admin jobs pages added"; files = @("app/admin/jobs/page.tsx", "app/admin/jobs/[id]/page.tsx", "app/admin/jobs/[id]/edit/page.tsx") },
  @{ msg = "admin applications pages added"; files = @("app/admin/applications/page.tsx", "app/admin/applications/[id]/page.tsx") },
  @{ msg = "admin posts pages added"; files = @("app/admin/posts/page.tsx", "app/admin/posts/[id]/page.tsx", "app/admin/posts/[id]/edit/page.tsx") },
  @{ msg = "admin skills pages added"; files = @("app/admin/skills/page.tsx", "app/admin/skills/new/page.tsx", "app/admin/skills/[id]/edit/page.tsx") },
  @{ msg = "admin interests pages added"; files = @("app/admin/interests/page.tsx", "app/admin/interests/new/page.tsx", "app/admin/interests/[id]/edit/page.tsx") },
  @{ msg = "admin reports and profile pages added"; files = @("app/admin/reports/page.tsx", "app/admin/profile/page.tsx") }
)

foreach ($c in $commits) {
  foreach ($f in $c.files) {
    git add -- "$f"
  }
  git commit -m $c.msg
}

Write-Host "Created $(git rev-list --count HEAD) commits"
