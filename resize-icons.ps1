Add-Type -AssemblyName System.Drawing

$src = "$PSScriptRoot\Su.png"
$source = [System.Drawing.Image]::FromFile($src)
Write-Host "Source: $($source.Width) x $($source.Height)"

function Resize-Png([string]$outPath, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($source, 0, 0, $size, $size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "Wrote $outPath ($size px)"
}

Resize-Png "$PSScriptRoot\icon-512.png"          512
Resize-Png "$PSScriptRoot\icon-192.png"          192
Resize-Png "$PSScriptRoot\apple-touch-icon.png"  180
Resize-Png "$PSScriptRoot\favicon-32.png"         32

$source.Dispose()
