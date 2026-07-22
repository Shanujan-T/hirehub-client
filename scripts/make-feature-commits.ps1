$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$commits = @(
  @{ msg = "constants notify via and micro internship added"; files = @("lib/constants.ts") },
  @{ msg = "types differentiator interfaces added"; files = @("types/index.ts") },
  @{ msg = "auth service notification prefs added"; files = @("services/auth.ts") },
  @{ msg = "quiz service added"; files = @("services/quiz.ts") },
  @{ msg = "jobs service salary insights added"; files = @("services/jobs.ts") },
  @{ msg = "job card distance and micro internship badge updated"; files = @("components/cards/index.tsx") },
  @{ msg = "my skills quiz verify link added"; files = @("app/my/skills/page.tsx") },
  @{ msg = "skill quiz page added"; files = @("app/my/skills/[id]/quiz/page.tsx") },
  @{ msg = "profile notification prefs and badges added"; files = @("app/profile/page.tsx") },
  @{ msg = "dashboard profile completion bar added"; files = @("app/dashboard/page.tsx") },
  @{ msg = "jobs page salary insights widget added"; files = @("app/jobs/page.tsx") },
  @{ msg = "job detail distance display added"; files = @("app/jobs/[id]/page.tsx") },
  @{ msg = "feature commits script added"; files = @("scripts/make-feature-commits.ps1") }
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

Write-Host "Created $created client commits ($(git rev-list --count HEAD) total)"
