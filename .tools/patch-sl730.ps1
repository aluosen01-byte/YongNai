Add-Type -AssemblyName System.Drawing

$src  = "D:\projects\YongNai\.ppt_extract\ppt\media\image22.png"
$work = "D:\projects\YongNai\.ppt_extract\image22-sl730.png"

# Chinese literals are built from code points so the script stays pure ASCII
# (Windows PowerShell reads BOM-less scripts as ANSI, which would corrupt them).
$GU  = [string][char]0x56FA   # gu
$HAN = [string][char]0x542B   # han
$LIANG = [string][char]0x91CF # liang
$solidLabel = "$GU$HAN$LIANG 40%~45%"
$modelLabel = "SL-730"

$modelTarget = [pscustomobject]@{ CX = 600; CY = 752; W = 113; Y0 = 728; Y1 = 782; Mode = 'dark' }
$solidTarget = [pscustomobject]@{ CX = 600; CY = 845; W = 154; Y0 = 824; Y1 = 870; Mode = 'sat'  }

$bmp = [System.Drawing.Bitmap]::FromFile($src)

function Get-InkBox($bmp, [int]$x0, [int]$y0, [int]$x1, [int]$y1, [string]$mode) {
  $minX = 99999; $minY = 99999; $maxX = -1; $maxY = -1
  for ($y = $y0; $y -lt $y1; $y++) {
    for ($x = $x0; $x -lt $x1; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $mx = [math]::Max($c.R, [math]::Max($c.G, $c.B))
      $mn = [math]::Min($c.R, [math]::Min($c.G, $c.B))
      if ($mode -eq 'sat') { $ink = ($mx - $mn) -gt 50 }
      else { $ink = $mx -lt 200 }
      if ($ink) {
        if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { return $null }
  return [pscustomobject]@{ X = $minX; Y = $minY; W = ($maxX - $minX + 1); H = ($maxY - $minY + 1) }
}

function Get-Darkest($bmp, $box) {
  $best = $null; $bestLum = 999
  for ($y = $box.Y; $y -lt ($box.Y + $box.H); $y++) {
    for ($x = $box.X; $x -lt ($box.X + $box.W); $x++) {
      $c = $bmp.GetPixel($x, $y)
      $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
      if ($lum -lt $bestLum) { $bestLum = $lum; $best = $c }
    }
  }
  return $best
}
function Get-Saturated($bmp, $box) {
  $best = $null; $bestSat = -1
  for ($y = $box.Y; $y -lt ($box.Y + $box.H); $y++) {
    for ($x = $box.X; $x -lt ($box.X + $box.W); $x++) {
      $c = $bmp.GetPixel($x, $y)
      $mx = [math]::Max($c.R, [math]::Max($c.G, $c.B))
      $mn = [math]::Min($c.R, [math]::Min($c.G, $c.B))
      $sat = ($mx - $mn) * ($mx / 255.0)
      if ($sat -gt $bestSat) { $bestSat = $sat; $best = $c }
    }
  }
  return $best
}

$oModel = Get-InkBox $bmp 500 $modelTarget.Y0 720 $modelTarget.Y1 'dark'
$oSolid = Get-InkBox $bmp 470 $solidTarget.Y0 740 $solidTarget.Y1 'sat'
$modelColor = Get-Darkest $bmp $oModel
$amberColor = Get-Saturated $bmp $oSolid
$bgColor = $bmp.GetPixel(820, 800)
Write-Output ("colours: model=#{0:X2}{1:X2}{2:X2} amber=#{3:X2}{4:X2}{5:X2} bg=#{6:X2}{7:X2}{8:X2}" -f `
  $modelColor.R, $modelColor.G, $modelColor.B, $amberColor.R, $amberColor.G, $amberColor.B, $bgColor.R, $bgColor.G, $bgColor.B)

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$eraser = New-Object System.Drawing.SolidBrush $bgColor
$typo = [System.Drawing.StringFormat]::GenericTypographic

# clear the two original text runs
$g.FillRectangle($eraser, 470, 724, 300, 62)
$g.FillRectangle($eraser, 440, 820, 340, 54)

function Draw-Into([System.Drawing.Graphics]$g, [System.Drawing.Bitmap]$bmp, [string]$text,
                   [string]$family, $style, [System.Drawing.Brush]$brush, $target) {
  $size = 30.0
  $px = $null; $py = $null
  $best = $null
  for ($iter = 0; $iter -lt 8; $iter++) {
    $font = New-Object System.Drawing.Font($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $sz = $g.MeasureString($text, $font, 5000, $typo)
    if ($null -eq $px) { $px = $target.CX - $sz.Width / 2; $py = $target.CY - $sz.Height / 2 }
    $g.DrawString($text, $font, $brush, (New-Object System.Drawing.PointF ([single]$px), ([single]$py)), $typo)
    $font.Dispose()
    $ink = Get-InkBox $bmp 380 $target.Y0 820 $target.Y1 $target.Mode
    if ($null -eq $ink) { Write-Output "  !! no ink detected"; break }
    $dx = $target.CX - ($ink.X + $ink.W / 2.0)
    $dy = $target.CY - ($ink.Y + $ink.H / 2.0)
    $ratio = $target.W / [double]$ink.W
    $score = [math]::Abs($ratio - 1) + [math]::Abs($dx) / 60.0 + [math]::Abs($dy) / 60.0
    Write-Output ("  iter {0}: ink w={1} dx={2:N1} dy={3:N1} size={4:N2} ratio={5:N3} score={6:N4}" -f `
      $iter, $ink.W, $dx, $dy, $size, $ratio, $score)
    if ($null -eq $best -or $score -lt $best.Score) {
      $best = [pscustomobject]@{ Size = $size; Px = $px + $dx; Py = $py + $dy; Score = $score }
    }
    if ([math]::Abs($dx) -le 1 -and [math]::Abs($dy) -le 1 -and [math]::Abs($ratio - 1) -le 0.01) { break }
    $g.FillRectangle($eraser, 380, $target.Y0, 460, ($target.Y1 - $target.Y0))
    $size = $size * $ratio
    $px += $dx; $py += $dy
  }
  # always finish with a single, deliberate draw of the best candidate
  $g.FillRectangle($eraser, 380, $target.Y0, 460, ($target.Y1 - $target.Y0))
  $font = New-Object System.Drawing.Font($family, $best.Size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString($text, $font, $brush, (New-Object System.Drawing.PointF ([single]$best.Px), ([single]$best.Py)), $typo)
  $font.Dispose()
  $ink = Get-InkBox $bmp 380 $target.Y0 820 $target.Y1 $target.Mode
  if ($ink) {
    Write-Output ("  final: size={0:N2} ink w={1} centre=({2},{3}) / target=({4},{5})" -f `
      $best.Size, $ink.W, ($ink.X + $ink.W / 2.0), ($ink.Y + $ink.H / 2.0), $target.CX, $target.CY)
  }
}

Write-Output "model:"
$bModel = New-Object System.Drawing.SolidBrush $modelColor
Draw-Into $g $bmp $modelLabel "Arial" ([System.Drawing.FontStyle]::Bold) $bModel $modelTarget

Write-Output "solid:"
$bSolid = New-Object System.Drawing.SolidBrush $amberColor
Draw-Into $g $bmp $solidLabel "Microsoft YaHei" ([System.Drawing.FontStyle]::Bold) $bSolid $solidTarget

$g.Dispose()
$bmp.Save($work, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$prev = [System.Drawing.Image]::FromFile($work)
$pv = New-Object System.Drawing.Bitmap 600, 380
$pg = [System.Drawing.Graphics]::FromImage($pv)
$pg.Clear([System.Drawing.Color]::White)
$pg.InterpolationMode = 'HighQualityBicubic'
$pg.DrawImage($prev, (New-Object System.Drawing.Rectangle 0, 0, 600, 380), (New-Object System.Drawing.Rectangle 320, 630, 560, 355), [System.Drawing.GraphicsUnit]::Pixel)
$pg.Dispose()
$pv.Save("D:\projects\YongNai\.ppt_extract\sl730-preview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pv.Dispose(); $prev.Dispose()
Write-Output "done"
