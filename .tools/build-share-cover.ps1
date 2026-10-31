# Builds both share covers: 5:4 for 转发, 1:1 for 朋友圈.
# Chinese literals are composed from code points so this file stays pure ASCII
# (Windows PowerShell reads BOM-less scripts as ANSI).
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$ROOT = 'D:\projects\YongNai'
$LOGO = Join-Path $ROOT 'miniprogram\assets\brand\logo.png'
$OUTDIR = Join-Path $ROOT 'miniprogram\assets\share'
if (-not (Test-Path $OUTDIR)) { New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null }

$slogan = -join @(0x4E00,0x6B21,0x63A5,0x89E6,0x0020,0x6C38,0x4E0D,0x5206,0x79BB | ForEach-Object { [char]$_ })
$sub    = -join @(0x6C34,0x6027,0x73AF,0x4FDD,0x80F6,0x7C98,0x5242,0x0020,0x00B7,0x0020,0x81EA,0x6709,0x4EA7,0x7EBF | ForEach-Object { [char]$_ })

function New-Cover([int]$W, [int]$H, [string]$OUT) {
  $bmp = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'

  $c1 = [System.Drawing.ColorTranslator]::FromHtml('#2A4F5D')
  $c2 = [System.Drawing.ColorTranslator]::FromHtml('#0E2027')
  $rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, ([single]38)
  $g.FillRectangle($bg, $rect)
  $bg.Dispose()

  $ring = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(26, 255, 255, 255)), ([single]2)
  $g.DrawEllipse($ring, [single]($W - 230), [single]-190, [single](0.62 * $W), [single](0.62 * $W))
  $ring2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(18, 255, 255, 255)), ([single]2)
  $g.DrawEllipse($ring2, [single]-180, [single]($H - 210), [single](0.52 * $W), [single](0.52 * $W))
  $ring.Dispose(); $ring2.Dispose()

  # logo plaque, centred horizontally, upper third
  $pw = [int]($W * 0.58); $ph = [int]($pw * 0.565)
  $px = [int](($W - $pw) / 2); $py = [int]($H * 0.16)
  $radius = [int]($W * 0.031)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc([single]$px, [single]$py, [single]$d, [single]$d, 180, 90)
  $path.AddArc([single]($px + $pw - $d), [single]$py, [single]$d, [single]$d, 270, 90)
  $path.AddArc([single]($px + $pw - $d), [single]($py + $ph - $d), [single]$d, [single]$d, 0, 90)
  $path.AddArc([single]$px, [single]($py + $ph - $d), [single]$d, [single]$d, 90, 90)
  $path.CloseFigure()
  $plaque = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $g.FillPath($plaque, $path)
  $plaque.Dispose(); $path.Dispose()

  $logo = [System.Drawing.Image]::FromFile($LOGO)
  $lw = [int]($pw * 0.86); $lh = [int]($logo.Height * ($lw / $logo.Width))
  $g.DrawImage($logo, [int](($W - $lw) / 2), [int]($py + ($ph - $lh) / 2), $lw, $lh)
  $logo.Dispose()

  $fmt = [System.Drawing.StringFormat]::GenericTypographic
  $sloganSize = [int]($W * 0.062)
  $fSlogan = New-Object System.Drawing.Font('Microsoft YaHei', $sloganSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $bWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $m = $g.MeasureString($slogan, $fSlogan, 5000, $fmt)
  $sy = $py + $ph + [int]($H * 0.075)
  $g.DrawString($slogan, $fSlogan, $bWhite, (New-Object System.Drawing.PointF ([single](($W - $m.Width) / 2), [single]$sy)), $fmt)
  $fSlogan.Dispose(); $bWhite.Dispose()

  $amber = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#F0A22E'))
  $ruleW = [int]($W * 0.09)
  $ry = $sy + [int]($m.Height) + [int]($H * 0.042)
  $g.FillRectangle($amber, [int](($W - $ruleW) / 2), $ry, $ruleW, 3)
  $amber.Dispose()

  $fSub = New-Object System.Drawing.Font('Microsoft YaHei', [int]($W * 0.032), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $bSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(160, 255, 255, 255))
  $ms = $g.MeasureString($sub, $fSub, 5000, $fmt)
  $g.DrawString($sub, $fSub, $bSub, (New-Object System.Drawing.PointF ([single](($W - $ms.Width) / 2), [single]($ry + [int]($H * 0.036)))), $fmt)
  $fSub.Dispose(); $bSub.Dispose()

  $g.Dispose()
  $bmp.Save($OUT, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("{0}  {1} x {2}  {3} KB" -f (Split-Path $OUT -Leaf), $W, $H, [math]::Round((Get-Item $OUT).Length / 1kb))
}

New-Cover 640 512 (Join-Path $OUTDIR 'share-cover.png')     # 转发卡片 5:4
New-Cover 750 750 (Join-Path $OUTDIR 'share-timeline.png')  # 朋友圈 1:1
