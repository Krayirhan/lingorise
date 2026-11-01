$ErrorActionPreference = 'Continue'
$buildId = '8e16e269-d032-4b74-9718-4b7191c8b8d3'
$logPath = 'D:\LingoRise\.audit\eas\production-submit-watch.log'
while ($true) {
  $timestamp = Get-Date -Format o
  try {
    $build = (npx eas-cli build:view $buildId --json 2>$null | Out-String | ConvertFrom-Json)
    "$timestamp build status: $($build.status)" | Add-Content $logPath
    if ($build.status -eq 'FINISHED') {
      npx eas-cli submit -p android --id $buildId --non-interactive --no-wait *>> $logPath
      "$((Get-Date).ToString('o')) submission command completed" | Add-Content $logPath
      exit 0
    }
    if ($build.status -in @('ERRORED', 'CANCELED')) {
      "$((Get-Date).ToString('o')) build ended: $($build.status)" | Add-Content $logPath
      exit 1
    }
  } catch {
    "$timestamp watcher error: $($_.Exception.Message)" | Add-Content $logPath
  }
  Start-Sleep -Seconds 60
}
