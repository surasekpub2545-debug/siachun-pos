Add-Type -AssemblyName System.Drawing

function New-AppIcon([string]$outPath, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background: rounded square in cream
    $rad = [int]($size * 0.22)
    $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $bgPath.AddArc(0, 0, $rad*2, $rad*2, 180, 90)
    $bgPath.AddArc($size - $rad*2, 0, $rad*2, $rad*2, 270, 90)
    $bgPath.AddArc($size - $rad*2, $size - $rad*2, $rad*2, $rad*2, 0, 90)
    $bgPath.AddArc(0, $size - $rad*2, $rad*2, $rad*2, 90, 90)
    $bgPath.CloseFigure()
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0xF2, 0xEB, 0xDB))
    $g.FillPath($bgBrush, $bgPath)

    # Inner green circle (the brand mark from login)
    $circD = [int]($size * 0.56)
    $cx = $size / 2.0
    $cy = $size / 2.0
    $circX = $cx - $circD / 2.0
    $circY = $cy - $circD / 2.0 - ($size * 0.04)
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0x3D, 0x5A, 0x40))
    $g.FillEllipse($greenBrush, $circX, $circY, $circD, $circD)

    # Leaf — teardrop with slight tilt
    $leafW = $circD * 0.50
    $leafH = $circD * 0.72
    $tilt = 14   # degrees CCW
    $state = $g.Save()
    $g.TranslateTransform($cx, $cy - ($size * 0.04))
    $g.RotateTransform(-$tilt)

    $hh = [float]($leafH / 2)
    $hq = [float]($leafH / 4)
    $wh = [float]($leafW / 2)

    $top = New-Object System.Drawing.PointF ([float]0, [float](-$hh))
    $bot = New-Object System.Drawing.PointF ([float]0, [float]$hh)
    $rc1 = New-Object System.Drawing.PointF ([float]$wh, [float]$hq)
    $rc2 = New-Object System.Drawing.PointF ([float]$wh, [float](-$hq))
    $lc1 = New-Object System.Drawing.PointF ([float](-$wh), [float](-$hq))
    $lc2 = New-Object System.Drawing.PointF ([float](-$wh), [float]$hq)

    $leafPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $leafPath.AddBezier($top, $rc2, $rc1, $bot)
    $leafPath.AddBezier($bot, $lc2, $lc1, $top)
    $leafPath.CloseFigure()

    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0xFB, 0xF7, 0xEC))
    $g.FillPath($whiteBrush, $leafPath)

    # Center vein
    $veinPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(0x3D, 0x5A, 0x40))
    $veinPen.Width = [float][Math]::Max(2, $size * 0.02)
    $veinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $veinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($veinPen, [float]0, [float](-$hh * 0.85), [float]0, [float]($hh * 0.85))

    $g.Restore($state)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "Wrote $outPath ($size px)"
}

$root = $PSScriptRoot
New-AppIcon "$root\icon-192.png" 192
New-AppIcon "$root\icon-512.png" 512
New-AppIcon "$root\apple-touch-icon.png" 180
New-AppIcon "$root\favicon-32.png" 32
