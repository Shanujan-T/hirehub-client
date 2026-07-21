$ErrorActionPreference = "Stop"

$clientRoot = Split-Path $PSScriptRoot -Parent
$apiRoot = Join-Path (Split-Path $clientRoot -Parent) "hirehub-api"

if (-not (Test-Path $apiRoot)) {
  Write-Error "Could not find hirehub-api at $apiRoot"
}

function Test-ApiUp {
  try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -UseBasicParsing -TimeoutSec 2
    return $true
  } catch {
    return $false
  }
}

if (-not (Test-ApiUp)) {
  Write-Host "Starting Flask API on http://127.0.0.1:5000 ..."
  Start-Process powershell -WindowStyle Minimized -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$apiRoot'; python run.py"
  )

  $deadline = (Get-Date).AddSeconds(90)
  while ((Get-Date) -lt $deadline) {
    if (Test-ApiUp) {
      Write-Host "API is ready."
      break
    }
    Start-Sleep -Seconds 2
  }

  if (-not (Test-ApiUp)) {
    Write-Error "API did not start in time. Run manually: cd hirehub-api; python run.py"
  }
} else {
  Write-Host "API already running on http://127.0.0.1:5000"
}

Set-Location $clientRoot
npm run dev
