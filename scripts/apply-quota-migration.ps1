# Applique les migrations Supabase (quotas + stats super admin)
# Copiez le SQL dans le SQL Editor Supabase si la CLI n'est pas disponible.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$migrations = @(
  "20250614120000_quota_enforcement.sql",
  "20250614130000_super_admin_org_stats.sql"
)

Write-Host "Migrations a appliquer :" -ForegroundColor Cyan
foreach ($m in $migrations) {
  Write-Host "  - supabase\migrations\$m"
}

if (Get-Command supabase -ErrorAction SilentlyContinue) {
  Write-Host "`nApplication via supabase db push..."
  Push-Location $root
  supabase db push
  Pop-Location
  if ($LASTEXITCODE -eq 0) { Write-Host "OK" -ForegroundColor Green; exit 0 }
}

Write-Host "`nSupabase CLI indisponible ou push echoue." -ForegroundColor Yellow
Write-Host "Collez chaque fichier SQL dans : Supabase Dashboard > SQL Editor > Run" -ForegroundColor Yellow
