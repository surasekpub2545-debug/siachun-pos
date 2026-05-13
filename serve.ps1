$root = $PSScriptRoot
$prefix = 'http://localhost:8772/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.jsx'  = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
    $path = Join-Path -Path $root -ChildPath $rel
    if (Test-Path -LiteralPath $path -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $res.ContentType = $ct
      $res.Headers.Add('Cache-Control','no-store')
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
    }
  } catch {
    Write-Host "ERR: $($_.Exception.Message)"
    $res.StatusCode = 500
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
