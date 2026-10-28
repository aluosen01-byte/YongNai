Add-Type -AssemblyName System.Drawing

$media = "D:\projects\YongNai\.ppt_extract\ppt\media"
$root  = "D:\projects\YongNai\miniprogram\assets"
foreach ($d in @("$root\products", "$root\company", "$root\certs", "$root\cases", "$root\icon")) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

# ---------- helpers ----------

function New-OnWhite([System.Drawing.Image]$img) {
  $bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.CompositingQuality = 'HighQuality'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
  $g.Dispose()
  return $bmp
}

function Get-ContentBox([System.Drawing.Bitmap]$bmp, [int]$threshold) {
  $data = $bmp.LockBits(
    (New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height),
    [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  try {
    $stride = $data.Stride
    $bytes = New-Object byte[] ($stride * $bmp.Height)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
    $minX = $bmp.Width; $minY = $bmp.Height; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $bmp.Height; $y++) {
      $row = $y * $stride
      for ($x = 0; $x -lt $bmp.Width; $x++) {
        $i = $row + $x * 3
        if ($bytes[$i] -lt $threshold -or $bytes[$i + 1] -lt $threshold -or $bytes[$i + 2] -lt $threshold) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }
  } finally { $bmp.UnlockBits($data) }
  if ($maxX -lt 0) { return @{ X = 0; Y = 0; W = $bmp.Width; H = $bmp.Height } }
  return @{ X = $minX; Y = $minY; W = ($maxX - $minX + 1); H = ($maxY - $minY + 1) }
}

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$quality) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $bmp.Save($path, $codec, $params)
}

function Save-Resized([string]$srcPath, [string]$dstPath, [int]$maxSide, [int]$quality, [switch]$Crop) {
  $img = [System.Drawing.Image]::FromFile($srcPath)
  try {
    $bmp = New-OnWhite $img
    $x = 0; $y = 0; $w = $bmp.Width; $h = $bmp.Height
    if ($Crop) {
      $box = Get-ContentBox $bmp 246
      # pad 6% of the content box so the drop shadow is not clipped
      $pad = [int]([math]::Max($box.W, $box.H) * 0.06)
      $x = [math]::Max(0, $box.X - $pad)
      $y = [math]::Max(0, $box.Y - $pad)
      $w = [math]::Min($bmp.Width - $x, $box.W + $pad * 2)
      $h = [math]::Min($bmp.Height - $y, $box.H + $pad * 2)
    }
    $scale = [math]::Min(1.0, $maxSide / [math]::Max($w, $h))
    $tw = [int][math]::Round($w * $scale)
    $th = [int][math]::Round($h * $scale)
    $out = New-Object System.Drawing.Bitmap $tw, $th, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.PixelOffsetMode = 'HighQuality'
    $g.CompositingQuality = 'HighQuality'
    $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, $tw, $th), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose(); $bmp.Dispose()
    Save-Jpeg $out $dstPath $quality
    $out.Dispose()
  } finally { $img.Dispose() }
}

# ---------- product renders: auto-crop whitespace, square canvas ----------
$products = [ordered]@{
  'SL-101' = 15; 'SL-286' = 16; 'SL-360' = 17
  'SL-111' = 18; 'SL-112' = 19; 'SL-113' = 20; 'SL-201' = 21
  'SL-730' = 22; 'SL-740' = 22; 'SL-750' = 23
  'SL-901' = 24; 'SL-902' = 25; 'SL-518' = 26
  'SL-128' = 27; 'SL-4350' = 28; 'SL-4360' = 29; 'PH-7' = 30
}
foreach ($kv in $products.GetEnumerator()) {
  $model = $kv.Key
  $src = Join-Path $media "image$($kv.Value).png"
  $dst = Join-Path "$root\products" (($model -replace '[^A-Za-z0-9-]', '') + '.jpg')
  Save-Resized $src $dst 460 86 -Crop
  Write-Output "$model <- image$($kv.Value).png"
}

# ---------- company photos ----------
$company = [ordered]@{
  'office'    = 'image2.png'
  'warehouse' = 'image3.png'
  'drums'     = 'image4.png'
}
foreach ($kv in $company.GetEnumerator()) {
  Save-Resized (Join-Path $media $kv.Value) (Join-Path "$root\company" ($kv.Key + '.jpg')) 900 78
  Write-Output "company/$($kv.Key) <- $($kv.Value)"
}

# ---------- certificates ----------
$certs = [ordered]@{
  'trademark' = 'image5.jpeg'
  'report'    = 'image6.jpeg'
  'iso'       = 'image7.jpeg'
  'patent'    = 'image8.jpeg'
}
foreach ($kv in $certs.GetEnumerator()) {
  Save-Resized (Join-Path $media $kv.Value) (Join-Path "$root\certs" ($kv.Key + '.jpg')) 760 80
  Write-Output "certs/$($kv.Key) <- $($kv.Value)"
}

# ---------- case photos ----------
$cases = [ordered]@{
  'case-zhaoqing' = 'image9.jpeg'
  'case-shenzhen' = 'image10.jpeg'
  'case-anxi'     = 'image11.jpeg'
}
foreach ($kv in $cases.GetEnumerator()) {
  Save-Resized (Join-Path $media $kv.Value) (Join-Path "$root\cases" ($kv.Key + '.jpg')) 760 78
  Write-Output "cases/$($kv.Key) <- $($kv.Value)"
}

# ---------- wechat QR (keep lossless) ----------
$qr = [System.Drawing.Image]::FromFile((Join-Path $media 'image31.png'))
$qb = New-OnWhite $qr
$qo = New-Object System.Drawing.Bitmap 640, 640, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$qg = [System.Drawing.Graphics]::FromImage($qo)
$qg.Clear([System.Drawing.Color]::White)
$qg.InterpolationMode = 'HighQualityBicubic'
$qg.DrawImage($qb, 0, 0, 640, 640)
$qg.Dispose(); $qb.Dispose(); $qr.Dispose()
$qo.Save((Join-Path "$root\company" 'wechat-qr.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$qo.Dispose()
Write-Output "company/wechat-qr.png <- image31.png"

Write-Output "`n----- output sizes -----"
Get-ChildItem -Recurse -File $root | Sort-Object Length -Descending |
  Select-Object @{n='Path';e={$_.FullName.Replace($root,'')}}, @{n='KB';e={[math]::Round($_.Length/1kb,1)}} |
  Format-Table -AutoSize
$total = (Get-ChildItem -Recurse -File $root | Measure-Object Length -Sum).Sum
Write-Output ("TOTAL: {0:N0} KB" -f ($total / 1kb))
