param(
    [string]$DbUser = "postgres",
    [string]$PgHost = "localhost",
    [int]$Port = 5432,
    [string]$AdminDb = "postgres",
    [string]$SqlFile = "D:\React\learndb\postgres_setup.sql",
    [string]$PgBinPath = "",
    [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

function Find-Psql {
    param([string]$CustomPgBinPath)

    if ($CustomPgBinPath -and (Test-Path (Join-Path $CustomPgBinPath "psql.exe"))) {
        return (Join-Path $CustomPgBinPath "psql.exe")
    }

    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $defaultVersions = @("17", "16", "15", "14", "13")
    foreach ($v in $defaultVersions) {
        $candidate = "C:\Program Files\PostgreSQL\$v\bin\psql.exe"
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "Khong tim thay psql.exe. Hay cai PostgreSQL hoac truyen -PgBinPath."
}

if (-not (Test-Path $SqlFile)) {
    throw "Khong tim thay file SQL: $SqlFile"
}

$psql = Find-Psql -CustomPgBinPath $PgBinPath
Write-Host "Su dung psql: $psql" -ForegroundColor Cyan
Write-Host "Chay script: $SqlFile" -ForegroundColor Cyan

# ON_ERROR_STOP=1 de dung ngay khi gap loi
& $psql -h $PgHost -p $Port -U $DbUser -d $AdminDb -v ON_ERROR_STOP=1 -f $SqlFile
if ($LASTEXITCODE -ne 0) {
    throw "Import that bai. Kiem tra lai username/password, host/port va noi dung SQL."
}

Write-Host "Da chay xong postgres_setup.sql" -ForegroundColor Green

if (-not $SkipVerify) {
    Write-Host "Kiem tra nhanh row count bang sales..." -ForegroundColor Cyan
    & $psql -h $PgHost -p $Port -U $DbUser -d learndb -c "SELECT COUNT(*) AS sales_rows FROM sales;"
    if ($LASTEXITCODE -ne 0) {
        throw "Da tao DB nhung khong verify duoc bang sales."
    }
}

Write-Host "Hoan tat setup PostgreSQL cho dataset learndb." -ForegroundColor Green
