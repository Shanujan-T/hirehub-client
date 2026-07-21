$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$commits = @(
  @{ msg = "env local example api proxy settings updated"; files = @(".env.local.example") },
  @{ msg = "next config hirehub api rewrite updated"; files = @("next.config.ts") },
  @{ msg = "package json dev all script added"; files = @("package.json") },
  @{ msg = "dev with api startup script added"; files = @("scripts/dev-with-api.ps1") },
  @{ msg = "api client connection error handling updated"; files = @("lib/api-client.ts") },
  @{ msg = "constants auth paths updated"; files = @("lib/constants.ts") },
  @{ msg = "utils dashboard path routing fixed"; files = @("lib/utils.ts") },
  @{ msg = "types company profile fields updated"; files = @("types/index.ts") },
  @{ msg = "auth provider establish session helper added"; files = @("providers/auth-provider.tsx") },
  @{ msg = "auth service avatar upload endpoint added"; files = @("services/auth.ts") },
  @{ msg = "social service community membership updated"; files = @("services/social.ts") },
  @{ msg = "register page welcome toast updated"; files = @("app/auth/register/page.tsx") },
  @{ msg = "avatar upload component added"; files = @("components/avatar-upload.tsx") },
  @{ msg = "my communities shared view added"; files = @("components/communities/my-communities-view.tsx") },
  @{ msg = "seeker my communities page added"; files = @("app/my-communities/page.tsx") },
  @{ msg = "employer communities page refactored"; files = @("app/employer/communities/page.tsx") },
  @{ msg = "main layout my communities nav added"; files = @("components/layout/main-layout.tsx") },
  @{ msg = "communities detail join status updated"; files = @("app/communities/[id]/page.tsx") },
  @{ msg = "community post detail page updated"; files = @("app/community/[id]/page.tsx") },
  @{ msg = "companies detail profile page updated"; files = @("app/companies/[id]/page.tsx") },
  @{ msg = "employer company profile page updated"; files = @("app/employer/company/page.tsx") },
  @{ msg = "seeker profile avatar upload added"; files = @("app/profile/page.tsx") },
  @{ msg = "admin profile avatar upload added"; files = @("app/admin/profile/page.tsx") },
  @{ msg = "company card profile display updated"; files = @("components/cards/index.tsx") },
  @{ msg = "post card author avatar updated"; files = @("components/post-card.tsx") },
  @{ msg = "shared avatar component updated"; files = @("components/ui/shared.tsx") },
  @{ msg = "jobs detail salary display updated"; files = @("app/jobs/[id]/page.tsx") },
  @{ msg = "employer candidates list page updated"; files = @("app/employer/candidates/page.tsx") },
  @{ msg = "employer candidate detail page updated"; files = @("app/employer/candidates/[id]/page.tsx") },
  @{ msg = "employer applicants page updated"; files = @("app/employer/jobs/[id]/applicants/page.tsx") },
  @{ msg = "seeker dashboard page updated"; files = @("app/dashboard/page.tsx") },
  @{ msg = "ui button component updated"; files = @("components/ui/button.tsx") },
  @{ msg = "ui card component updated"; files = @("components/ui/card.tsx") },
  @{ msg = "ui form component updated"; files = @("components/ui/form.tsx") },
  @{ msg = "ui input component updated"; files = @("components/ui/input.tsx") },
  @{ msg = "ui loading component updated"; files = @("components/ui/loading.tsx") },
  @{ msg = "ui modal component updated"; files = @("components/ui/modal.tsx") }
)

$created = 0
foreach ($c in $commits) {
  $added = $false
  foreach ($f in $c.files) {
    if ((Test-Path $f) -and (git status --porcelain -- "$f")) {
      git add -- "$f"
      $added = $true
    }
  }
  if ($added) {
    git commit -m $c.msg
    $created++
  }
}

Write-Host "Created $created incremental commits ($(git rev-list --count HEAD) total)"
