param(
  [switch]$OnlyEnemies
)

Add-Type -AssemblyName System.Drawing

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot

$units = @(
  @{ UnitId = 'warrior'; Folder = 'assets\art\units\warrior'; Base = 'warrior_star1.png' },
  @{ UnitId = 'mage'; Folder = 'assets\art\units\mage'; Base = 'mage_star1.png' },
  @{ UnitId = 'priest'; Folder = 'assets\art\units\priest'; Base = 'priest_star1.png' },
  @{ UnitId = 'archer'; Folder = 'assets\art\units\archer'; Base = 'archer_star1.png' },
  @{ UnitId = 'shield_guard'; Folder = 'assets\art\units\shield_guard'; Base = 'shield_guard_star1.png' },
  @{ UnitId = 'spearman'; Folder = 'assets\art\units\spearman'; Base = 'spearman_star1.png' },
  @{ UnitId = 'berserker'; Folder = 'assets\art\units\warrior'; Base = 'berserker_divine.png' },
  @{ UnitId = 'light_mage'; Folder = 'assets\art\units\priest'; Base = 'light_mage_divine.png' }
)

$enemies = @(
  @{ UnitId = 'grunt'; Folder = 'assets\art\enemies'; Base = 'grunt.png' },
  @{ UnitId = 'brute'; Folder = 'assets\art\enemies'; Base = 'brute.png' },
  @{ UnitId = 'boss'; Folder = 'assets\art\enemies'; Base = 'boss.png' }
)

$moveFrames = @(
  @{ Rotation = -3; OffsetX = -6; OffsetY = 14; ScaleX = 1.00; ScaleY = 0.98; Alpha = 1.00 },
  @{ Rotation = -1; OffsetX = -2; OffsetY = 6; ScaleX = 1.00; ScaleY = 1.00; Alpha = 1.00 },
  @{ Rotation =  0; OffsetX =  0; OffsetY = 0; ScaleX = 1.00; ScaleY = 1.00; Alpha = 1.00 },
  @{ Rotation =  2; OffsetX =  4; OffsetY = 8; ScaleX = 1.00; ScaleY = 0.99; Alpha = 1.00 },
  @{ Rotation =  4; OffsetX =  8; OffsetY = 16; ScaleX = 1.00; ScaleY = 0.97; Alpha = 1.00 }
)

$attackFrames = @(
  @{ Rotation = -10; OffsetX = -10; OffsetY = 8; ScaleX = 1.00; ScaleY = 1.00; Alpha = 1.00 },
  @{ Rotation =  -5; OffsetX =  16; OffsetY = -4; ScaleX = 1.03; ScaleY = 0.98; Alpha = 1.00 },
  @{ Rotation =   7; OffsetX =  44; OffsetY = -20; ScaleX = 1.08; ScaleY = 0.96; Alpha = 1.00 },
  @{ Rotation =  14; OffsetX =  18; OffsetY = -2; ScaleX = 1.04; ScaleY = 0.98; Alpha = 1.00 },
  @{ Rotation =   2; OffsetX =   4; OffsetY = 4; ScaleX = 1.00; ScaleY = 1.00; Alpha = 1.00 }
)

$deathFrames = @(
  @{ Rotation =  0; OffsetX =  0; OffsetY = 0; ScaleX = 1.00; ScaleY = 1.00; Alpha = 1.00 },
  @{ Rotation = 18; OffsetX = 18; OffsetY = 34; ScaleX = 1.00; ScaleY = 0.98; Alpha = 1.00 },
  @{ Rotation = 42; OffsetX = 52; OffsetY = 102; ScaleX = 1.00; ScaleY = 0.96; Alpha = 1.00 },
  @{ Rotation = 68; OffsetX = 88; OffsetY = 186; ScaleX = 0.98; ScaleY = 0.95; Alpha = 1.00 },
  @{ Rotation = 88; OffsetX = 110; OffsetY = 254; ScaleX = 0.97; ScaleY = 0.94; Alpha = 1.00 }
)

$corpseFadeFrames = @(
  @{ Rotation = 88; OffsetX = 110; OffsetY = 254; ScaleX = 0.97; ScaleY = 0.94; Alpha = 1.00 },
  @{ Rotation = 88; OffsetX = 112; OffsetY = 258; ScaleX = 0.96; ScaleY = 0.93; Alpha = 0.80 },
  @{ Rotation = 88; OffsetX = 114; OffsetY = 262; ScaleX = 0.95; ScaleY = 0.92; Alpha = 0.58 },
  @{ Rotation = 88; OffsetX = 116; OffsetY = 266; ScaleX = 0.94; ScaleY = 0.91; Alpha = 0.36 },
  @{ Rotation = 88; OffsetX = 118; OffsetY = 270; ScaleX = 0.93; ScaleY = 0.90; Alpha = 0.18 }
)

function Save-Frame {
  param(
    [string]$SourcePath,
    [string]$DestPath,
    [hashtable]$Spec
  )

  $source = [System.Drawing.Bitmap]::FromFile($SourcePath)
  try {
    $width = $source.Width
    $height = $source.Height
    $canvas = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $matrix = New-Object System.Drawing.Imaging.ColorMatrix
        $matrix.Matrix33 = [single]$Spec.Alpha
        $attributes = New-Object System.Drawing.Imaging.ImageAttributes
        try {
          $attributes.SetColorMatrix($matrix)

          $graphics.TranslateTransform(($width / 2) + $Spec.OffsetX, ($height / 2) + $Spec.OffsetY)
          $graphics.RotateTransform([single]$Spec.Rotation)
          $graphics.ScaleTransform([single]$Spec.ScaleX, [single]$Spec.ScaleY)
          $graphics.TranslateTransform(-($width / 2), -($height / 2))

          $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
          $graphics.DrawImage($source, $rect, 0, 0, $width, $height, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
        }
        finally {
          $attributes.Dispose()
        }
      }
      finally {
        $graphics.Dispose()
      }

      $canvas.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $canvas.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

function Write-Sequence {
  param(
    [string]$UnitId,
    [string]$FolderPath,
    [string]$SourcePath,
    [string]$Prefix,
    [System.Collections.IEnumerable]$Frames
  )

  $index = 1
  foreach ($frame in $Frames) {
    $filename = '{0}_{1}_{2:00}.png' -f $UnitId, $Prefix, $index
    Save-Frame -SourcePath $SourcePath -DestPath (Join-Path $FolderPath $filename) -Spec $frame
    $index += 1
  }
}

if (-not $OnlyEnemies) {
  foreach ($unit in $units) {
    $folderPath = Join-Path $workspaceRoot $unit.Folder
    $sourcePath = Join-Path $folderPath $unit.Base
    if (-not (Test-Path $sourcePath)) {
      throw "Missing source art for $($unit.UnitId): $sourcePath"
    }

    Write-Sequence -UnitId $unit.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'move' -Frames $moveFrames
    Write-Sequence -UnitId $unit.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'attack' -Frames $attackFrames
    Write-Sequence -UnitId $unit.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'death_fall' -Frames $deathFrames
    Write-Sequence -UnitId $unit.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'corpse_fade' -Frames $corpseFadeFrames
  }
}

foreach ($enemy in $enemies) {
  $folderPath = Join-Path $workspaceRoot $enemy.Folder
  $sourcePath = Join-Path $folderPath $enemy.Base
  if (-not (Test-Path $sourcePath)) {
    throw "Missing source art for $($enemy.UnitId): $sourcePath"
  }

  Write-Sequence -UnitId $enemy.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'move' -Frames $moveFrames
  Write-Sequence -UnitId $enemy.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'attack' -Frames $attackFrames
  Write-Sequence -UnitId $enemy.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'death_fall' -Frames $deathFrames
  Write-Sequence -UnitId $enemy.UnitId -FolderPath $folderPath -SourcePath $sourcePath -Prefix 'corpse_fade' -Frames $corpseFadeFrames
}

Write-Output 'Stickman action frames generated.'
