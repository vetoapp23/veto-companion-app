# Restore Supabase dashboard backup (.backup.gz) into a NEW project.
# Prerequisites: PostgreSQL 17+ client (psql) in PATH.
# Docs: https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore

param(
    [Parameter(Mandatory = $true)]
    [string]$ConnectionString,

    [string]$BackupGz = "$env:USERPROFILE\Downloads\db_cluster-11-09-2025@23-05-04.backup.gz",

    [string]$OutDir = "$PSScriptRoot\..\restore"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql not found. Install PostgreSQL 17+ and add its bin folder to PATH."
}

if (-not (Test-Path $BackupGz)) {
    Write-Error "Backup not found: $BackupGz"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$backupFile = Join-Path $OutDir "db_cluster.backup"

Write-Host "Decompressing backup..."
python -c "import gzip,shutil; gzip.open(r'$BackupGz','rb'); shutil.copyfileobj(gzip.open(r'$BackupGz','rb'), open(r'$backupFile','wb'))"

Write-Host "Restoring with psql (some errors are expected on a fresh project)..."
psql $ConnectionString -v ON_ERROR_STOP=0 -f $backupFile

Write-Host "Done. Check Supabase Dashboard > Table Editor."
