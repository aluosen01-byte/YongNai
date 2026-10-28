# Renders the mini-program pages to PNG via headless Chrome.
# The HTML is produced by .tools/preview.js from the real WXML/WXSS/page modules.

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$ROOT = 'D:\projects\YongNai'
$MP = Join-Path $ROOT 'miniprogram'
$TMP = Join-Path $ROOT '.tmp'
$PREVIEW = Join-Path $TMP 'preview'
$SHOTS = Join-Path $TMP 'shots'
$CHROME = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$PROFILE = Join-Path $TMP 'chrome-profile'

if (-not (Test-Path $CHROME)) { throw "Chrome not found at $CHROME" }
foreach ($d in @($PREVIEW, $SHOTS)) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

# ---------- 1. compile page modules ----------
Write-Output '== compiling =='
$files = @()
$files += Get-ChildItem (Join-Path $MP 'pages\*\*.ts') | ForEach-Object { $_.FullName }
$files += Get-ChildItem (Join-Path $MP 'data\*.ts') | ForEach-Object { $_.FullName }
$files += (Get-Item (Join-Path $MP 'utils\util.ts')).FullName
$files += (Get-Item (Join-Path $MP 'config.ts')).FullName
if (Test-Path (Join-Path $TMP 'render')) { Remove-Item (Join-Path $TMP 'render') -Recurse -Force }
& "D:\projects\deepseek-harness\node_modules\.bin\tsc.cmd" @files --outDir (Join-Path $TMP 'render') `
  --module commonjs --target es2020 --skipLibCheck --ignoreConfig --esModuleInterop 2>&1 | Out-Null

# ---------- 2. build html ----------
Write-Output '== building html =='
Push-Location $ROOT
& node .tools\preview.js 2>&1 | ForEach-Object { $_.ToString() }
Pop-Location

$pages = Get-Content (Join-Path $PREVIEW 'pages.json') -Raw | ConvertFrom-Json

# ---------- 3. screenshot + crop ----------
function Crop-ToContent([string]$srcPng, [string]$dstPng) {
  $img = [System.Drawing.Image]::FromFile($srcPng)
  $w = $img.Width; $h = $img.Height
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose(); $img.Dispose()

  $data = $bmp.LockBits((New-Object System.Drawing.Rectangle 0, 0, $w, $h),
    [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $bmp.UnlockBits($data)

  # the preview canvas is a fixed 375px wide body on a magenta html background,
  # so the content edge and the last content row can both be found from pixels
  $isMagenta = {
    param($b, $i)
    ([math]::Abs([int]$b[$i] - 0xFF) -le 8) -and
    ([math]::Abs([int]$b[$i+1] - 0x00) -le 8) -and
    ([math]::Abs([int]$b[$i+2] - 0xFF) -le 8)
  }

  # content width: first non-magenta column scanning in from the right
  $contentW = $w
  $probeRow = ($h - 10) * $stride
  for ($x = $w - 1; $x -ge 0; $x--) {
    if (-not (& $isMagenta $bytes ($probeRow + $x * 3))) { $contentW = $x + 1; break }
  }
  if ($contentW -lt 100 -or $contentW -gt $w) { $contentW = $w }

  # page background is the cream tone; 24bpp GDI+ is stored BGR
  $bgBlue = 0xEA; $bgGreen = 0xF1; $bgRed = 0xF4
  $tol = 6
  $bottom = 0
  for ($y = $h - 1; $y -ge 0; $y -= 2) {
    $row = $y * $stride
    $hit = $false
    for ($x = 0; $x -lt $contentW; $x += 4) {
      $i = $row + $x * 3
      if ([math]::Abs([int]$bytes[$i] - $bgBlue) -gt $tol -or
          [math]::Abs([int]$bytes[$i+1] - $bgGreen) -gt $tol -or
          [math]::Abs([int]$bytes[$i+2] - $bgRed) -gt $tol) { $hit = $true; break }
    }
    if ($hit) { $bottom = $y; break }
  }
  $cropH = [math]::Min($h, $bottom + 40)
  $bmp.Dispose()

  $out = New-Object System.Drawing.Bitmap $contentW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $og = [System.Drawing.Graphics]::FromImage($out)
  $og.Clear([System.Drawing.Color]::White)
  $src2 = [System.Drawing.Image]::FromFile($srcPng)
  $og.DrawImage($src2, (New-Object System.Drawing.Rectangle 0, 0, $contentW, $cropH),
    (New-Object System.Drawing.Rectangle 0, 0, $contentW, $cropH), [System.Drawing.GraphicsUnit]::Pixel)
  $og.Dispose(); $src2.Dispose()
  $out.Save($dstPng, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
  return [pscustomobject]@{ W = $contentW; H = $cropH }
}

foreach ($name in $pages) {
  $html = Join-Path $PREVIEW ($name + '.html')
  $raw = Join-Path $SHOTS ($name + '-raw.png')
  $final = Join-Path $SHOTS ($name + '.png')
  $uri = 'file:///' + ($html -replace '\\', '/')

  & $CHROME '--headless=new' '--disable-gpu' '--hide-scrollbars' '--no-first-run' `
    '--allow-file-access-from-files' '--force-device-scale-factor=2' `
    '--window-size=800,7000' '--virtual-time-budget=4000' `
    "--user-data-dir=$PROFILE" "--screenshot=$raw" $uri 2>&1 | Out-Null

  if (-not (Test-Path $raw)) { Write-Output "!! screenshot failed for $name"; continue }
  $dim = Crop-ToContent $raw $final
  Remove-Item $raw -Force
  $kb = [math]::Round((Get-Item $final).Length / 1kb)
  Write-Output ("{0,-12} {1} x {2}  {3} KB" -f $name, $dim.W, $dim.H, $kb)
}

Write-Output "`ndone -> $SHOTS"
