# Builds the 5:4 share cover used by onShareAppMessage / onShareTimeline.
# Chinese literals are composed from code points so this file stays pure ASCII
# (Windows PowerShell reads BOM-less scripts as ANSI).
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$ROOT = 'D:\projects\YongNai'
$LOGO = Join-Path $ROOT 'miniprogram\assets\brand\logo.png'
$OUTDIR = Join-Path $ROOT 'miniprogram\assets\share'
if (-not (Test-Path $OUTDIR)) { New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null }
$OUT = Join-Path $OUTDIR 'share-cover.png'

# --- strings from code points ---
$slogan = -join @(0x4E00,0x6B21,0x63A5,0x89E6,0x0020,0x6C38,0x4E0D,0x5206,0x79BB | ForEach-Object { [char]$_ })
$sub    = -join @(0x6C34,0x6027,0x73AF,0x4FDD,0x80F6,0x7C98,0x5242,0x0020,0x00B7,0x0020,0x81EA,0x6709,0x4EA7,0x7EBF | ForEach-Object { [char]$_ })

$W = 640; $H = 512
$bmp = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.InterpolationMode = 'HighQualityBicubic'
$g.PixelOffsetMode = 'HighQuality'
$g.CompositingQuality = 'HighQuality'

# --- background gradient ---
$c1 = [System.Drawing.ColorTranslator]::FromHtml('#2A4F5D')
$c2 = [System.Drawing.ColorTranslator]::FromHtml('#0E2027')
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, ([single]38)
$g.FillRectangle($bg, $rect)
$bg.Dispose()

# --- decorative rings ---
$ring = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(26, 255, 255, 255)), ([single]2)
$g.DrawEllipse($ring, [single]410, [single]-150, [single]420, [single]420)
$ring2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(18, 255, 255, 255)), ([single]2)
$g.DrawEllipse($ring2, [single]-170, [single]300, [single]380, [single]380)
$ring.Dispose(); $ring2.Dispose()

# --- logo plaque ---
$pw = 372; $ph = 210
$px = [int](($W - $pw) / 2); $py = 72
$radius = 20
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
$lw = 320; $lh = [int]($logo.Height * ($lw / $logo.Width))
$g.DrawImage($logo, [int](($W - $lw) / 2), [int]($py + ($ph - $lh) / 2), $lw, $lh)
$logo.Dispose()

# --- slogan ---
$fmt = [System.Drawing.StringFormat]::GenericTypographic
$fSlogan = New-Object System.Drawing.Font('Microsoft YaHei', 40, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$bWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$m = $g.MeasureString($slogan, $fSlogan, 5000, $fmt)
$g.DrawString($slogan, $fSlogan, $bWhite, (New-Object System.Drawing.PointF ([single](($W - $m.Width) / 2), [single]312)), $fmt)

# --- amber rule ---
$amber = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#F0A22E'))
$ruleW = 56
$g.FillRectangle($amber, [int](($W - $ruleW) / 2), 372, $ruleW, 3)

# --- subtitle ---
$fSub = New-Object System.Drawing.Font('Microsoft YaHei', 21, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$bSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(160, 255, 255, 255))
$ms = $g.MeasureString($sub, $fSub, 5000, $fmt)
$g.DrawString($sub, $fSub, $bSub, (New-Object System.Drawing.PointF ([single](($W - $ms.Width) / 2), [single]398)), $fmt)

$g.Dispose()
$bmp.Save($OUT, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output ("share cover: {0} x {1}, {2} KB" -f $W, $H, [math]::Round((Get-Item $OUT).Length / 1kb))
