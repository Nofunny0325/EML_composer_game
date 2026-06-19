$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $Root "apps\web"

Write-Host "Starting EML Composer locally..."

function Run-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $FilePath @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw "npm.cmd was not found. Install Node.js LTS and reopen PowerShell."
}

if (-not (Test-Path (Join-Path $WebDir ".env"))) {
  Copy-Item -LiteralPath (Join-Path $WebDir ".env.example") -Destination (Join-Path $WebDir ".env")
  Write-Host "Created apps\web\.env from .env.example."
  Write-Host "Edit DATABASE_URL before running the server."
  return
}

$EnvPath = Join-Path $WebDir ".env"
$EnvText = Get-Content -LiteralPath $EnvPath -Raw

if ($EnvText -notmatch "DATABASE_URL\s*=\s*`"?postgresql://") {
  Write-Host ""
  Write-Host "DATABASE_URL is not a PostgreSQL URL yet."
  Write-Host "Open apps\web\.env and replace DATABASE_URL with your Supabase/Neon URL."
  Write-Host ""
  Write-Host "Example:"
  Write-Host 'DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"'
  Write-Host ""
  throw "Cannot start until DATABASE_URL is set to PostgreSQL."
}

if ($EnvText -match "DATABASE_URL=.*[\[\]#]") {
  Write-Host ""
  Write-Host "DATABASE_URL contains characters that often break PostgreSQL URLs: [, ], or #."
  Write-Host "Use a Supabase/Neon password with only letters and numbers, or URL-encode the password."
  Write-Host "Example safe password: EmlGame2026StrongPass"
  Write-Host ""
  throw "DATABASE_URL contains unsafe URL characters."
}

if ($EnvText -match "VERIFIER_URL") {
  Write-Host "Note: VERIFIER_URL is no longer used. You can remove it from apps\web\.env."
}

Push-Location $WebDir

Write-Host "Installing dependencies..."
Run-Checked "npm.cmd" "install"

Write-Host "Applying database schema..."
Run-Checked "npx.cmd" "prisma" "db" "push"

Write-Host "Seeding stages..."
Run-Checked "npm.cmd" "run" "db:seed"

Write-Host "Starting game site on http://127.0.0.1:3000"
npm.cmd run dev

Pop-Location
