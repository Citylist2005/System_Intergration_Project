$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$frontendUrl = "http://127.0.0.1:5173"
$backendUrl = "http://127.0.0.1:3000/api/v1"

function Test-HttpReady {
  param(
    [string] $Url
  )

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-HttpReady {
  param(
    [string] $Name,
    [string] $Url,
    [int] $TimeoutSeconds = 60
  )

  Write-Host "Dang doi $Name san sang: $Url"
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-HttpReady -Url $Url) {
      Write-Host "$Name da san sang."
      return $true
    }

    Start-Sleep -Seconds 2
  }

  Write-Warning "$Name chua phan hoi sau $TimeoutSeconds giay. Hay xem log trong cua so terminal tuong ung."
  return $false
}

if (-not (Test-Path $backendDir)) {
  throw "Khong tim thay thu muc backend: $backendDir"
}

if (-not (Test-Path $frontendDir)) {
  throw "Khong tim thay thu muc frontend: $frontendDir"
}

Write-Host "Khoi dong HR Payroll..."
Write-Host "Backend:  $backendDir"
Write-Host "Frontend: $frontendDir"

if (-not (Test-HttpReady -Url $backendUrl)) {
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendDir'; npm.cmd run start:dev"
  ) -WindowStyle Normal
} else {
  Write-Host "Backend dang chay san tren $backendUrl"
}

if (-not (Test-HttpReady -Url $frontendUrl)) {
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendDir'; npm.cmd run dev -- --host 127.0.0.1 --port 5173"
  ) -WindowStyle Normal
} else {
  Write-Host "Frontend dang chay san tren $frontendUrl"
}

Wait-HttpReady -Name "Backend" -Url $backendUrl -TimeoutSeconds 90 | Out-Null
Wait-HttpReady -Name "Frontend" -Url $frontendUrl -TimeoutSeconds 90 | Out-Null

Write-Host "Mo trinh duyet: $frontendUrl"
Start-Process $frontendUrl

Write-Host ""
Write-Host "Lenh dung cho nhom:"
Write-Host "  npm start"
Write-Host ""
Write-Host "Tai khoan dev mac dinh:"
Write-Host "  admin@docusync.local / change-me"
