# Builds the React site and creates deploy.zip, ready to upload to Hostinger.
# Run from the project folder:  powershell -ExecutionPolicy Bypass -File .\make-deploy-zip.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$stage = Join-Path $env:TEMP 'deploy-stage'
$zip = Join-Path $root 'deploy.zip'

Write-Host 'Building frontend...'
Push-Location (Join-Path $root 'frontend')
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed' }
Pop-Location

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }
New-Item -ItemType Directory $stage | Out-Null

# Copy only what the server needs. NO node_modules and NO .env files.
Copy-Item (Join-Path $root 'package.json') $stage
robocopy (Join-Path $root 'backend') (Join-Path $stage 'backend') /E /XD node_modules uploads /XF .env package-lock.json | Out-Null
robocopy (Join-Path $root 'frontend\dist') (Join-Path $stage 'frontend\dist') /E | Out-Null

# tar creates a zip with forward slashes, which Linux servers need.
tar -a -c -f $zip -C $stage .
Remove-Item $stage -Recurse -Force
Write-Host "Created $zip"
