# Switches 朋友圈 sharing to the 1:1 cover.
# Pure ASCII; uses .NET UTF-8 read/write (NOT Get-Content/Set-Content, which would
# decode BOM-less UTF-8 as ANSI and corrupt the Chinese).
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$files = @(
  'miniprogram\pages\home\home.ts',
  'miniprogram\pages\products\products.ts',
  'miniprogram\pages\detail\detail.ts',
  'miniprogram\pages\selector\selector.ts',
  'miniprogram\pages\about\about.ts',
  'miniprogram\pages\contact\contact.ts',
  'miniprogram\pages\sample\sample.ts'
)

foreach ($rel in $files) {
  $p = (Resolve-Path $rel).Path
  $t = [System.IO.File]::ReadAllText($p, $utf8)
  $before = $t

  # 1) import SHARE_TIMELINE_COVER as well
  $t = $t.Replace("SHARE_COVER } from '../../config'", "SHARE_COVER, SHARE_TIMELINE_COVER } from '../../config'")

  # 2) inside onShareTimeline only (identified by the query: line), use the 1:1 image
  $t = [regex]::Replace($t, "(query:[^\n]*\n\s*)imageUrl: SHARE_COVER,", "`${1}imageUrl: SHARE_TIMELINE_COVER,")

  if ($t -ne $before) {
    [System.IO.File]::WriteAllText($p, $t, $utf8)
  }

  $imports = ([regex]::Matches($t, 'SHARE_TIMELINE_COVER')).Count
  Write-Output ("{0,-40} SHARE_TIMELINE_COVER x{1}" -f $rel, $imports)
}
