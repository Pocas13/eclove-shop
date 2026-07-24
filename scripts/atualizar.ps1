# Eclove - atualizador oficial para Windows PowerShell 5.1 e PowerShell 7
# Os avisos enviados pelo npm para stderr nao sao tratados como falhas.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
  $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
} catch {}

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$log = Join-Path $raiz "atualizacao.log"
$temporarios = Join-Path $env:TEMP ("eclove-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temporarios -Force | Out-Null

if (Test-Path $log) { Remove-Item $log -Force }

function Escrever-Log([string]$texto) {
  $texto | Tee-Object -FilePath $log -Append
}

function Executar-Comando {
  param(
    [Parameter(Mandatory=$true)][string]$Titulo,
    [Parameter(Mandatory=$true)][string]$Comando
  )

  Write-Host "`n$Titulo" -ForegroundColor Cyan
  Add-Content -Path $log -Value "`n===== $Titulo ====="
  Add-Content -Path $log -Value "> $Comando"

  $stdout = Join-Path $temporarios (([Guid]::NewGuid().ToString("N")) + ".out.log")
  $stderr = Join-Path $temporarios (([Guid]::NewGuid().ToString("N")) + ".err.log")

  $processo = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/d", "/s", "/c", $Comando `
    -WorkingDirectory $raiz `
    -NoNewWindow `
    -Wait `
    -PassThru `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr

  if (Test-Path $stdout) {
    Get-Content $stdout -Encoding UTF8 | Tee-Object -FilePath $log -Append
  }
  if (Test-Path $stderr) {
    Get-Content $stderr -Encoding UTF8 | Tee-Object -FilePath $log -Append
  }

  if ($processo.ExitCode -ne 0) {
    throw "Falhou: $Titulo (codigo $($processo.ExitCode)). Consulte atualizacao.log."
  }

  Write-Host "Concluido: $Titulo" -ForegroundColor Green
}

function Organizar-FicheirosAntigos {
  $pastaBackups = Join-Path (Split-Path $raiz -Parent) "eclove-shop-backups"
  $backups = Get-ChildItem -Path $raiz -Filter ".env.backup-*" -File -ErrorAction SilentlyContinue

  if ($backups.Count -gt 0) {
    New-Item -ItemType Directory -Path $pastaBackups -Force | Out-Null
    foreach ($backup in $backups) {
      $destino = Join-Path $pastaBackups $backup.Name
      Move-Item -Path $backup.FullName -Destination $destino -Force
    }
    Escrever-Log "Backups .env movidos para: $pastaBackups"
  }

  $ficheirosAntigos = @(
    "ATUALIZACAO-ECLOVE-V3.md",
    "ATUALIZACAO-ECLOVE.md",
    "ALTERACOES-ECLOVE-2026-07.md",
    "ALTERACOES-ECLOVE-V4.md",
    "ALTERACOES-ECLOVE-V5.md",
    "ALTERACOES-ECLOVE-V6.md",
    "ALTERACOES-ECLOVE-V7.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "SECURITY.md",
    "corrigir-preco.sql",
    "ATUALIZAR-PROJETO.md",
    "CORRECAO-E-ARRANQUE-WINDOWS.md",
    "DADOS-DE-DEMONSTRACAO.md",
    "IMPLEMENTACAO-ECLOVE.md",
    "INTEGRACAO-SAGE.md",
    "VALIDACAO-DESTA-VERSAO.md",
    "VERSAO-EM-DESENVOLVIMENTO.md",
    "tsconfig.tsbuildinfo"
  )

  foreach ($ficheiro in $ficheirosAntigos) {
    $caminho = Join-Path $raiz $ficheiro
    if (Test-Path $caminho) { Remove-Item $caminho -Force }
  }

  $scriptsAntigos = @("atualizar-v3.ps1", "atualizar-demo-v4.ps1", "configurar-env.ps1", "verificar-projeto.ps1")
  foreach ($ficheiro in $scriptsAntigos) {
    $caminho = Join-Path (Join-Path $raiz "scripts") $ficheiro
    if (Test-Path $caminho) { Remove-Item $caminho -Force }
  }
}

try {
  Set-Location $raiz
  Organizar-FicheirosAntigos

  if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
  if (Test-Path "tsconfig.tsbuildinfo") { Remove-Item "tsconfig.tsbuildinfo" -Force }

  Executar-Comando "1/7 Instalar dependencias" "npm ci"
  Executar-Comando "2/7 Formatar e validar schema Prisma" "npx prisma format && npx prisma validate"
  Executar-Comando "3/7 Aplicar migracoes" "npx prisma migrate dev --name atualizacao"
  Executar-Comando "4/7 Gerar Prisma Client" "npx prisma generate"
  Executar-Comando "5/7 Criar/atualizar dados de demonstracao" "npm run seed:demo"
  Executar-Comando "6/7 Verificar TypeScript" "npm run typecheck"
  Executar-Comando "7/7 Compilar producao" "npm run build"

  Write-Host "`nAtualizacao concluida com sucesso." -ForegroundColor Green
  Write-Host "Inicie o projeto com: npm run dev"
  Write-Host "Log completo: $log"
}
catch {
  Write-Host "`n$($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Log completo: $log" -ForegroundColor Yellow
  exit 1
}
finally {
  if (Test-Path $temporarios) { Remove-Item $temporarios -Recurse -Force -ErrorAction SilentlyContinue }
}
