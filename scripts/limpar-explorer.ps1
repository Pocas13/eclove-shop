# Limpa ficheiros antigos que podem permanecer quando um ZIP e extraido
# por cima da pasta D:\eclove-shop. Preserva .env, codigo, base de dados e Git.

$ErrorActionPreference = "Stop"
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $raiz

$pastasAntigas = @(
  ".github",
  "docs"
)

foreach ($pasta in $pastasAntigas) {
  $caminho = Join-Path $raiz $pasta
  if (Test-Path $caminho) {
    Remove-Item $caminho -Recurse -Force
  }
}

$ficheirosExatos = @(
  "ATUALIZACAO-ECLOVE.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "SECURITY.md",
  "corrigir-preco.sql",
  "tsconfig.tsbuildinfo",
  "atualizacao.log"
)

foreach ($ficheiro in $ficheirosExatos) {
  $caminho = Join-Path $raiz $ficheiro
  if (Test-Path $caminho) {
    Remove-Item $caminho -Force
  }
}

Get-ChildItem -Path $raiz -File -Filter "ALTERACOES-ECLOVE*.md" -ErrorAction SilentlyContinue |
  Remove-Item -Force

# A pasta .next e gerada novamente pelo Next.js. Apagamo-la para remover cache antigo.
$caminhoNext = Join-Path $raiz ".next"
if (Test-Path $caminhoNext) {
  Remove-Item $caminhoNext -Recurse -Force
}

# Substitui configuracoes antigas do VS Code por uma configuracao minima,
# que esconde pastas geradas sem apagar node_modules.
$caminhoVsCode = Join-Path $raiz ".vscode"
if (Test-Path $caminhoVsCode) {
  Remove-Item $caminhoVsCode -Recurse -Force
}
New-Item -ItemType Directory -Path $caminhoVsCode -Force | Out-Null

@'
{
  "files.exclude": {
    "**/.github": true,
    "**/.next": true,
    "**/.vscode": true,
    "**/node_modules": true,
    "**/tsconfig.tsbuildinfo": true,
    "**/atualizacao.log": true
  },
  "search.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/public/dados/codigos-postais": true
  }
}
'@ | Set-Content -Path (Join-Path $caminhoVsCode "settings.json") -Encoding UTF8

Write-Host "Explorer limpo. No VS Code execute: Developer: Reload Window" -ForegroundColor Green
Write-Host "A pasta node_modules foi preservada e fica apenas escondida." -ForegroundColor DarkGray
