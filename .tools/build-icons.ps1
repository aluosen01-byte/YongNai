Add-Type -AssemblyName System.Drawing

$outDir = "D:\projects\YongNai\miniprogram\assets\icon"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$SIZE   = 81                 # final canvas (WeChat recommends 81 x 81)
$SS     = 4                  # supersample factor for smooth curves
$S      = $SIZE * $SS
$MARGIN = 10.0 * $SS
$SCALE  = ($SIZE - 20.0) / 24.0 * $SS    # 24-unit design grid -> padded canvas
$strokeW = 1.9 * $SCALE

$cNormal = [System.Drawing.ColorTranslator]::FromHtml("#A2ABB1")
$cActive = [System.Drawing.ColorTranslator]::FromHtml("#1F3A44")

function New-RoundedPath([double]$x, [double]$y, [double]$w, [double]$h, [double]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc([single]$x, [single]$y, [single]$d, [single]$d, 180, 90)
  $path.AddArc([single]($x + $w - $d), [single]$y, [single]$d, [single]$d, 270, 90)
  $path.AddArc([single]($x + $w - $d), [single]($y + $h - $d), [single]$d, [single]$d, 0, 90)
  $path.AddArc([single]$x, [single]($y + $h - $d), [single]$d, [single]$d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Convert-Points([object[]]$pairs) {
  # alternating x,y values on a 24-unit grid -> canvas points
  $list = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  for ($i = 0; $i -lt $pairs.Count; $i += 2) {
    $list.Add((New-Object System.Drawing.PointF (
      [single]($MARGIN + [double]$pairs[$i] * $SCALE)),
      ([single]($MARGIN + [double]$pairs[$i + 1] * $SCALE))))
  }
  return $list.ToArray()
}

function Save-Icon([scriptblock]$draw, [string]$file, $color) {
  $big = New-Object System.Drawing.Bitmap $S, $S, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($big)
  $g.SmoothingMode = 'AntiAlias'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  $pen = New-Object System.Drawing.Pen $color, ([single]$strokeW)
  $pen.LineJoin = 'Round'
  $pen.StartCap = 'Round'
  $pen.EndCap = 'Round'
  & $draw $g $pen
  $g.Dispose()
  $pen.Dispose()

  $final = New-Object System.Drawing.Bitmap $SIZE, $SIZE, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $fg = [System.Drawing.Graphics]::FromImage($final)
  $fg.InterpolationMode = 'HighQualityBicubic'
  $fg.PixelOffsetMode = 'HighQuality'
  $fg.CompositingQuality = 'HighQuality'
  $fg.Clear([System.Drawing.Color]::Transparent)
  $fg.DrawImage($big, 0, 0, $SIZE, $SIZE)
  $fg.Dispose()
  $big.Dispose()
  $final.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $final.Dispose()
}

# ---- home ----
$drawHome = {
  param($g, $pen)
  $body = Convert-Points @(3, 9.5, 12, 2.5, 21, 9.5, 21, 21, 3, 21, 3, 9.5)
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddPolygon($body)
  $g.DrawPath($pen, $p)
  $p.Dispose()
  $door = Convert-Points @(9.2, 21, 9.2, 13.6, 14.8, 13.6, 14.8, 21)
  $p2 = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p2.AddLines($door)
  $g.DrawPath($pen, $p2)
  $p2.Dispose()
}

# ---- products: 2 x 2 grid ----
$drawGrid = {
  param($g, $pen)
  foreach ($cell in @(@(3.2, 3.2), @(13.2, 3.2), @(3.2, 13.2), @(13.2, 13.2))) {
    $x = $MARGIN + $cell[0] * $SCALE + $strokeW / 2
    $y = $MARGIN + $cell[1] * $SCALE + $strokeW / 2
    $side = 7.6 * $SCALE - $strokeW
    $rp = New-RoundedPath $x $y $side $side (1.6 * $SCALE)
    $g.DrawPath($pen, $rp)
    $rp.Dispose()
  }
}

# ---- selector: concentric target ----
$drawTarget = {
  param($g, $pen)
  $cx = $MARGIN + 12 * $SCALE
  $cy = $MARGIN + 12 * $SCALE
  $r1 = 9.0 * $SCALE
  $r2 = 3.6 * $SCALE
  $g.DrawEllipse($pen, [single]($cx - $r1), [single]($cy - $r1), [single]($r1 * 2), [single]($r1 * 2))
  $g.DrawEllipse($pen, [single]($cx - $r2), [single]($cy - $r2), [single]($r2 * 2), [single]($r2 * 2))
}

# ---- contact: speech bubble ----
$drawChat = {
  param($g, $pen)
  $bw = 18.0 * $SCALE
  $bh = 13.4 * $SCALE
  $bx = $MARGIN + 3 * $SCALE
  $by = $MARGIN + 3.4 * $SCALE
  $rp = New-RoundedPath $bx $by $bw $bh (3.6 * $SCALE)
  $g.DrawPath($pen, $rp)
  $rp.Dispose()
  $tail = Convert-Points @(8.4, 16.6, 7.9, 21.4, 13.2, 16.6)
  $tp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $tp.AddLines($tail)
  $g.DrawPath($pen, $tp)
  $tp.Dispose()
}

# ---- sample: parcel box ----
$drawBox = {
  param($g, $pen)
  $body = Convert-Points @(3.6, 8.2, 12, 3.6, 20.4, 8.2, 20.4, 20.4, 3.6, 20.4, 3.6, 8.2)
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddPolygon($body)
  $g.DrawPath($pen, $p)
  $p.Dispose()
  $lid = Convert-Points @(3.6, 8.2, 20.4, 8.2)
  $p2 = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p2.AddLines($lid)
  $g.DrawPath($pen, $p2)
  $p2.Dispose()
  $seam = Convert-Points @(12, 8.2, 12, 20.4)
  $p3 = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p3.AddLines($seam)
  $g.DrawPath($pen, $p3)
  $p3.Dispose()
}

# ---- about: info circle ----
$drawInfo = {
  param($g, $pen)
  $cx = $MARGIN + 12 * $SCALE
  $cy = $MARGIN + 12 * $SCALE
  $r = 8.9 * $SCALE
  $g.DrawEllipse($pen, [single]($cx - $r), [single]($cy - $r), [single]($r * 2), [single]($r * 2))
  $dot = 1.5 * $SCALE
  $g.DrawEllipse($pen, [single]($cx - $dot), [single]($MARGIN + 7.2 * $SCALE - $dot), [single]($dot * 2), [single]($dot * 2))
  $stem = Convert-Points @(12, 11.2, 12, 16.8)
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddLines($stem)
  $g.DrawPath($pen, $p)
  $p.Dispose()
}

foreach ($spec in @(
    @{ Name = 'home';     Draw = $drawHome },
    @{ Name = 'products'; Draw = $drawGrid },
    @{ Name = 'selector'; Draw = $drawTarget },
    @{ Name = 'contact';  Draw = $drawChat },
    @{ Name = 'sample';   Draw = $drawBox },
    @{ Name = 'about';    Draw = $drawInfo }
  )) {
  Save-Icon $spec.Draw (Join-Path $outDir ($spec.Name + '.png'))        $cNormal
  Save-Icon $spec.Draw (Join-Path $outDir ($spec.Name + '-active.png')) $cActive
  Write-Output "icon: $($spec.Name)"
}

Get-ChildItem $outDir -Filter *.png | ForEach-Object { Write-Output ("  {0}  {1} bytes" -f $_.Name, $_.Length) }

# preview strip
$prev = New-Object System.Drawing.Bitmap 420, 110
$pg = [System.Drawing.Graphics]::FromImage($prev)
$pg.Clear([System.Drawing.ColorTranslator]::FromHtml("#E9E4DA"))
$i = 0
foreach ($n in @('home', 'products', 'selector', 'contact')) {
  $a = [System.Drawing.Image]::FromFile((Join-Path $outDir ($n + '.png')))
  $b = [System.Drawing.Image]::FromFile((Join-Path $outDir ($n + '-active.png')))
  $pg.DrawImage($a, 12 + $i * 100, 8, 72, 72)
  $pg.DrawImage($b, 12 + $i * 100, 78, 72, 72)
  $a.Dispose(); $b.Dispose()
  $i++
}
$pg.Dispose()
$prev.Save("D:\projects\YongNai\.ppt_extract\icons-preview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$prev.Dispose()
Write-Output "preview saved"
