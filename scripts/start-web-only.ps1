$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $Root "apps\web"

Push-Location $WebDir
Write-Host "Starting game site on http://127.0.0.1:3000"
npm.cmd run dev
Pop-Location
