$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$logDir = Join-Path $root 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$cf = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
if (-not (Test-Path $cf)) { $cf = 'cloudflared' }

$py = Join-Path $root 'venv\Scripts\python.exe'
if (-not (Test-Path $py)) { $py = 'python' }

$cfLog = Join-Path $logDir 'cloudflared.log'

function Stop-Existing {
    Write-Host 'Stopping any previous instance...' -ForegroundColor DarkGray

    $pids = @()
    try {
        $pids += Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    } catch { }
    try {
        $pids += Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" -ErrorAction SilentlyContinue |
            Where-Object { $_.CommandLine -match '127\.0\.0\.1:8000' } |
            Select-Object -ExpandProperty ProcessId
    } catch { }

    foreach ($procId in ($pids | Sort-Object -Unique)) {
        if ($procId -and $procId -gt 0) {
            & taskkill /F /T /PID $procId 2>$null | Out-Null
        }
    }
    Start-Sleep -Milliseconds 500
}

$cfProc = $null
$appProc = $null

try {
    Stop-Existing

    if (Test-Path $cfLog) { Remove-Item $cfLog -Force -ErrorAction SilentlyContinue }

    Write-Host '[1/3] Starting Cloudflare tunnel...' -ForegroundColor Cyan
    $cfArgs = @('tunnel', '--url', 'http://127.0.0.1:8000', '--no-autoupdate', '--logfile', $cfLog)
    $cfProc = Start-Process -FilePath $cf -ArgumentList $cfArgs -NoNewWindow -PassThru

    Write-Host '[2/3] Waiting for the public URL...' -ForegroundColor Cyan
    $url = $null
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Path $cfLog) {
            $match = Select-String -Path $cfLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue |
                Select-Object -First 1
            if ($match) {
                $url = [regex]::Match($match.Line, 'https://[a-z0-9-]+\.trycloudflare\.com').Value
                break
            }
        }
        if ($cfProc.HasExited) { break }
    }

    if (-not $url) {
        Write-Host 'ERROR: Could not detect the public URL.' -ForegroundColor Red
        Write-Host "Check the log: $cfLog"
        Read-Host 'Press Enter to exit'
        return
    }
    Write-Host "      Public URL: $url" -ForegroundColor Green

    $envPath = Join-Path $root '.env'
    $lines = [System.IO.File]::ReadAllLines($envPath, [System.Text.Encoding]::UTF8)
    $found = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^SITE_URL=') {
            $lines[$i] = "SITE_URL=$url"
            $found = $true
        }
    }
    if (-not $found) { $lines += "SITE_URL=$url" }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($envPath, $lines, $utf8NoBom)
    Write-Host '      Updated SITE_URL in .env' -ForegroundColor DarkGray

    Write-Host '[3/3] Starting the app on http://127.0.0.1:8000 ...' -ForegroundColor Cyan
    $appProc = Start-Process -FilePath $py -ArgumentList 'wsgi.py' -WorkingDirectory $root -NoNewWindow -PassThru

    Start-Sleep -Seconds 3
    try {
        $resp = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/health' -TimeoutSec 10
        Write-Host "      Health: $($resp.StatusCode) $($resp.Content)" -ForegroundColor Green
    } catch {
        Write-Host "      Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host '      (Is MySQL / XAMPP running?)' -ForegroundColor Yellow
    }

    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Yellow
    Write-Host '  READY. Share this link:' -ForegroundColor Yellow
    Write-Host ''
    Write-Host "  $url" -ForegroundColor Green
    Write-Host ''
    Write-Host "  Admin login: $url/admin/login" -ForegroundColor Gray
    Write-Host '============================================================' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Keep this window open while people are using the link.' -ForegroundColor Gray
    Read-Host 'Press Enter to stop the app and tunnel'
}
finally {
    Write-Host 'Stopping app and tunnel...' -ForegroundColor DarkGray
    if ($cfProc -and -not $cfProc.HasExited) { & taskkill /F /T /PID $cfProc.Id 2>$null | Out-Null }
    if ($appProc -and -not $appProc.HasExited) { & taskkill /F /T /PID $appProc.Id 2>$null | Out-Null }
    Write-Host 'Stopped.' -ForegroundColor DarkGray
}
