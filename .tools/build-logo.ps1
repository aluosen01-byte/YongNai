# Turns the supplied brand PNG (near-white background) into trimmed,
# transparent assets for the mini-program.
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$SRC = 'D:\projects\YongNai\docs\brand\logo-source.png'
$OUTDIR = 'D:\projects\YongNai\miniprogram\assets\brand'
if (-not (Test-Path $OUTDIR)) { New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null }

# ---------- load flattened onto white, 24bpp ----------
$srcImg = [System.Drawing.Image]::FromFile($SRC)
$W = $srcImg.Width; $H = $srcImg.Height
$flat = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($flat)
$g.Clear([System.Drawing.Color]::White)
$g.DrawImage($srcImg, 0, 0, $W, $H)
$g.Dispose(); $srcImg.Dispose()

$data = $flat.LockBits((New-Object System.Drawing.Rectangle 0, 0, $W, $H),
  [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$stride = $data.Stride
$src = New-Object byte[] ($stride * $H)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $src, 0, $src.Length)
$flat.UnlockBits($data); $flat.Dispose()

# ---------- key out the background ----------
$N = $W * $H
$alpha = New-Object byte[] $N
$rgb = New-Object byte[] ($N * 3)

for ($y = 0; $y -lt $H; $y++) {
  $row = $y * $stride
  $orow = $y * $W
  for ($x = 0; $x -lt $W; $x++) {
    $i = $row + $x * 3
    $b = [int]$src[$i]; $gr = [int]$src[$i+1]; $r = [int]$src[$i+2]
    $mn = [math]::Min($r, [math]::Min($gr, $b))
    $a = 1.0 - ($mn / 255.0)
    $idx = $orow + $x
    if ($a -le 0.025) { continue }
    if ($a -ge 0.985) { $alpha[$idx] = 255; $rgb[$idx*3] = $b; $rgb[$idx*3+1] = $gr; $rgb[$idx*3+2] = $r; continue }
    $nr = [math]::Min(255.0, [math]::Max(0.0, ($r - 255.0 * (1.0 - $a)) / $a))
    $ng = [math]::Min(255.0, [math]::Max(0.0, ($gr - 255.0 * (1.0 - $a)) / $a))
    $nb = [math]::Min(255.0, [math]::Max(0.0, ($b - 255.0 * (1.0 - $a)) / $a))
    $alpha[$idx] = [byte][math]::Round($a * 255)
    $rgb[$idx*3] = [byte]$nb; $rgb[$idx*3+1] = [byte]$ng; $rgb[$idx*3+2] = [byte]$nr
  }
}

# ---------- robust bbox (ignore isolated noise) ----------
$INK = 60
$colInk = New-Object int[] $W
$rowInk = New-Object int[] $H
for ($y = 0; $y -lt $H; $y++) {
  $orow = $y * $W
  for ($x = 0; $x -lt $W; $x++) {
    if ($alpha[$orow + $x] -ge $INK) { $colInk[$x]++; $rowInk[$y]++ }
  }
}
$minX = -1; $maxX = -1; $minY = -1; $maxY = -1
for ($x = 0; $x -lt $W; $x++) { if ($colInk[$x] -ge 3) { if ($minX -lt 0) { $minX = $x }; $maxX = $x } }
for ($y = 0; $y -lt $H; $y++) { if ($rowInk[$y] -ge 3) { if ($minY -lt 0) { $minY = $y }; $maxY = $y } }
Write-Output "content box: x=$minX..$maxX  y=$minY..$maxY  ($($maxX-$minX+1) x $($maxY-$minY+1))"

# ---------- flood fill the shell component (leftmost strong pixel) ----------
$seed = -1
for ($y = 0; $y -lt $H -and $seed -lt 0; $y++) {
  for ($x = 0; $x -le $maxX; $x++) {
    if ($alpha[$y * $W + $x] -ge $INK) { $seed = $y * $W + $x; break }
  }
}
$visited = New-Object bool[] $N
$queue = New-Object 'System.Collections.Generic.Queue[int]'
$queue.Enqueue($seed); $visited[$seed] = $true
$sMinX = $W; $sMaxX = -1; $sMinY = $H; $sMaxY = -1; $sCount = 0
while ($queue.Count -gt 0) {
  $p = $queue.Dequeue()
  $px = $p % $W; $py = [int](($p - $px) / $W)
  $sCount++
  if ($px -lt $sMinX) { $sMinX = $px }; if ($px -gt $sMaxX) { $sMaxX = $px }
  if ($py -lt $sMinY) { $sMinY = $py }; if ($py -gt $sMaxY) { $sMaxY = $py }
  if ($px -gt 0) { $q = $p - 1; if (-not $visited[$q] -and $alpha[$q] -ge $INK) { $visited[$q] = $true; $queue.Enqueue($q) } }
  if ($px -lt $W - 1) { $q = $p + 1; if (-not $visited[$q] -and $alpha[$q] -ge $INK) { $visited[$q] = $true; $queue.Enqueue($q) } }
  if ($py -gt 0) { $q = $p - $W; if (-not $visited[$q] -and $alpha[$q] -ge $INK) { $visited[$q] = $true; $queue.Enqueue($q) } }
  if ($py -lt $H - 1) { $q = $p + $W; if (-not $visited[$q] -and $alpha[$q] -ge $INK) { $visited[$q] = $true; $queue.Enqueue($q) } }
}
Write-Output "shell component: x=$sMinX..$sMaxX y=$sMinY..$sMaxY  pixels=$sCount"
$totalInk = 0
for ($i = 0; $i -lt $N; $i++) { if ($alpha[$i] -ge $INK) { $totalInk++ } }
Write-Output ("shell share of ink: {0:P1} (separate component = {1})" -f ($sCount / $totalInk), ($sMaxX -lt $maxX - 20))

# ---------- wordmark colour (right of the shell) ----------
$sr=0; $sg=0; $sb=0; $n=0
for ($y = $minY; $y -le $maxY; $y++) {
  $orow = $y * $W
  for ($x = [math]::Max($minX, $sMaxX + 20); $x -le $maxX; $x++) {
    $idx = $orow + $x
    if ($alpha[$idx] -ge 235) { $sb += $rgb[$idx*3]; $sg += $rgb[$idx*3+1]; $sr += $rgb[$idx*3+2]; $n++ }
  }
}
if ($n -gt 0) {
  Write-Output ("wordmark colour: #{0:X2}{1:X2}{2:X2}  (from {3} px)" -f [int]($sr/$n), [int]($sg/$n), [int]($sb/$n), $n)
}

# ---------- full-size transparent bitmap ----------
$full = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$fd = $full.LockBits((New-Object System.Drawing.Rectangle 0, 0, $W, $H),
  [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$fstride = $fd.Stride
$dst = New-Object byte[] ($fstride * $H)
for ($y = 0; $y -lt $H; $y++) {
  $orow = $y * $W
  $drow = $y * $fstride
  for ($x = 0; $x -lt $W; $x++) {
    $idx = $orow + $x
    $d = $drow + $x * 4
    $dst[$d] = $rgb[$idx*3]
    $dst[$d+1] = $rgb[$idx*3+1]
    $dst[$d+2] = $rgb[$idx*3+2]
    $dst[$d+3] = $alpha[$idx]
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($dst, 0, $fd.Scan0, $dst.Length)
$full.UnlockBits($fd)

# ---------- save helper ----------
function Save-Crop([int]$x0, [int]$y0, [int]$w, [int]$h, [int]$targetW, [string]$path) {
  $scale = [double]$targetW / [double]$w
  $tw = [int][math]::Round($w * $scale)
  $th = [int][math]::Round($h * $scale)
  $out = New-Object System.Drawing.Bitmap $tw, $th, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $og = [System.Drawing.Graphics]::FromImage($out)
  $og.Clear([System.Drawing.Color]::Transparent)
  $og.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $og.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $og.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $og.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $og.DrawImage($full,
    (New-Object System.Drawing.Rectangle 0, 0, $tw, $th),
    (New-Object System.Drawing.Rectangle $x0, $y0, $w, $h),
    [System.Drawing.GraphicsUnit]::Pixel)
  $og.Dispose()
  $out.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
  Write-Output ("  {0,-10} {1} x {2}  {3} KB" -f (Split-Path $path -Leaf), $tw, $th, [math]::Round((Get-Item $path).Length/1kb))
}

$pad = [int]([math]::Max($maxX - $minX, $maxY - $minY) * 0.015)
$cx0 = [math]::Max(0, $minX - $pad); $cy0 = [math]::Max(0, $minY - $pad)
$cw = [math]::Min($W - $cx0, ($maxX - $minX + 1) + $pad * 2)
$ch = [math]::Min($H - $cy0, ($maxY - $minY + 1) + $pad * 2)

Write-Output "assets:"
Save-Crop $cx0 $cy0 $cw $ch 560 (Join-Path $OUTDIR 'logo.png')

# square shell mark
$mw = $sMaxX - $sMinX + 1
$mh = $sMaxY - $sMinY + 1
$side = [int]([math]::Max($mw, $mh) * 1.06)
$sqX = [int]($sMinX - ($side - $mw) / 2)
$sqY = [int]($sMinY - ($side - $mh) / 2)
if ($sqX -lt 0) { $sqX = 0 }
if ($sqY -lt 0) { $sqY = 0 }
if ($sqX + $side -gt $W) { $side = $W - $sqX }
if ($sqY + $side -gt $H) { $side = $H - $sqY }
Save-Crop $sqX $sqY $side $side 240 (Join-Path $OUTDIR 'mark.png')

$full.Dispose()
Write-Output "done"

