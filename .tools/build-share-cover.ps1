# Builds both share covers in the app's light style:
#   share-cover.png     640x512   转发卡片（微信按 5:4 展示）
#   share-timeline.png  750x750   朋友圈（按 1:1 展示）
# Design: white field + the same skewed 米色细线 / 墨青条 / 橙色块 wedge as the home hero,
# logo top-left, amber slogan, grey sub line. Big shapes so it stays legible as a thumbnail.
# Chinese literals are composed from code points so this file stays pure ASCII.
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$ROOT = 'D:\projects\YongNai'
$LOGO = Join-Path $ROOT 'miniprogram\assets\brand\logo.png'
$OUTDIR = Join-Path $ROOT 'miniprogram\assets\share'
if (-not (Test-Path $OUTDIR)) { New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null }

$slogan = -join @(0x4E00,0x6B21,0x63A5,0x89E6,0x0020,0x6C38,0x4E0D,0x5206,0x79BB | ForEach-Object { [char]$_ })
$sub    = -join @(0x6C34,0x6027,0x73AF,0x4FDD,0x80F6,0x7C98,0x5242,0x0020,0x00B7,0x0020,
                  0x5341,0x4E03,0x4E2A,0x5728,0x552E,0x578B,0x53F7 | ForEach-Object { [char]$_ })

$cInk    = [System.Drawing.ColorTranslator]::FromHtml('#1F3A44')
$cAmber  = [System.Drawing.ColorTranslator]::FromHtml('#F0A22E')
$cCream  = [System.Drawing.ColorTranslator]::FromHtml('#F4F1EA')
$cMuted  = [System.Drawing.ColorTranslator]::FromHtml('#5C666B')

function Add-Parallelogram($g, [double]$left, [double]$right, [double]$W, [double]$H, [double]$slope, $brush) {
  $half = $H / 2.0
  $pts = @(
    (New-Object System.Drawing.PointF ([single]($left - $half * $slope)), 0),
    (New-Object System.Drawing.PointF ([single]($right - $half * $slope)), 0),
    (New-Object System.Drawing.PointF ([single]($right + $half * $slope)), ([single]$H)),
    (New-Object System.Drawing.PointF ([single]($left + $half * $slope)), ([single]$H))
  )
  $g.FillPolygon($brush, $pts)
}

function New-Cover([int]$W, [int]$H, [string]$OUT) {
  $bmp = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'

  # white field
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $g.FillRectangle($white, 0, 0, $W, $H)

  # skewed wedge on the right, mirroring the home hero (5deg, right anchored)
  $slope = [math]::Tan(5.0 * [math]::PI / 180.0)
  $wedgeW = 0.24 * $W
  $wl = $W - $wedgeW
  $lineW = 0.010 * $W
  $gapA = 0.026 * $W
  $bandW = 0.070 * $W
  $gapB = 0.026 * $W

  $bLine = New-Object System.Drawing.SolidBrush $cCream
  $bBand = New-Object System.Drawing.SolidBrush $cInk
  $bBlock = New-Object System.Drawing.SolidBrush $cAmber
  Add-Parallelogram $g $wl ($wl + $lineW) $W $H $slope $bLine
  $bandL = $wl + $lineW + $gapA
  Add-Parallelogram $g $bandL ($bandL + $bandW) $W $H $slope $bBand
  $blockL = $bandL + $bandW + $gapB
  Add-Parallelogram $g $blockL ($W + $H * $slope) $W $H $slope $bBlock
  $bLine.Dispose(); $bBand.Dispose(); $bBlock.Dispose(); $white.Dispose()

  # ---- content block, vertically centred ----
  $pad = 0.075 * $W
  $contentW = $blockL - $pad - 0.03 * $W

  $logoImg = [System.Drawing.Image]::FromFile($LOGO)
  $logoW = [math]::Min(0.46 * $W, $contentW)
  $logoH = $logoW / ($logoImg.Width / $logoImg.Height)

  $sloganSize = [single](0.074 * $W)
  $subSize = [single](0.033 * $W)
  $fSlogan = New-Object System.Drawing.Font('Microsoft YaHei', $sloganSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fSub = New-Object System.Drawing.Font('Microsoft YaHei', $subSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = [System.Drawing.StringFormat]::GenericTypographic

  $mSlogan = $g.MeasureString($slogan, $fSlogan, 5000, $fmt)
  $mSub = $g.MeasureString($sub, $fSub, 5000, $fmt)

  $gap1 = 0.050 * $W
  $gap2 = 0.034 * $W
  $ruleH = [math]::Max(3, [int](0.005 * $W))
  $gap3 = 0.030 * $W
  $total = $logoH + $gap1 + $mSlogan.Height + $gap2 + $ruleH + $gap3 + $mSub.Height

  $y = ($H - $total) / 2.0
  $g.DrawImage($logoImg, [int]$pad, [int]$y, [int]$logoW, [int]$logoH)
  $logoImg.Dispose()
  $y += $logoH + $gap1

  $bAmber = New-Object System.Drawing.SolidBrush $cAmber
  $g.DrawString($slogan, $fSlogan, $bAmber, (New-Object System.Drawing.PointF ([single]$pad), ([single]$y)), $fmt)
  $y += $mSlogan.Height + $gap2
  $bAmber.Dispose()

  $bRule = New-Object System.Drawing.SolidBrush $cAmber
  $g.FillRectangle($bRule, [int]$pad, [int]$y, [int](0.10 * $W), $ruleH)
  $bRule.Dispose()
  $y += $ruleH + $gap3

  $bMuted = New-Object System.Drawing.SolidBrush $cMuted
  $g.DrawString($sub, $fSub, $bMuted, (New-Object System.Drawing.PointF ([single]$pad), ([single]$y)), $fmt)
  $bMuted.Dispose()

  $fSlogan.Dispose(); $fSub.Dispose()
  $g.Dispose()
  $bmp.Save($OUT, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("{0,-20} {1} x {2}  {3} KB" -f (Split-Path $OUT -Leaf), $W, $H, [math]::Round((Get-Item $OUT).Length / 1kb))
}

New-Cover 640 512 (Join-Path $OUTDIR 'share-cover.png')
New-Cover 750 750 (Join-Path $OUTDIR 'share-timeline.png')
