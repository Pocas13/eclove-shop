$ErrorActionPreference = "Stop"
$connections = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "A porta 3002 está livre." -ForegroundColor Green
  exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $pids) {
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($process) {
    Write-Host "A terminar $($process.ProcessName) (PID $processId), que está a usar a porta 3002..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force
  }
}

Write-Host "A porta 3002 ficou livre." -ForegroundColor Green
