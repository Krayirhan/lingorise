#requires -Version 5.1
# PreToolUse hook: denies recursive/destructive filesystem delete commands
# run via Bash or PowerShell tools. Fails open on any parse/unexpected error.

$ErrorActionPreference = 'Stop'

function Test-BashDestructiveRm {
    param([string]$Command)

    $segments = [regex]::Split($Command, '[;&|\r\n]+')
    foreach ($segment in $segments) {
        $trimmed = $segment.Trim()
        if ($trimmed -notmatch '(?i)^\s*rm\b(.*)$') {
            continue
        }
        $argsPart = $Matches[1]
        $tokens = $argsPart -split '\s+' | Where-Object { $_ -ne '' }

        $hasRecursive = $false
        $hasForce = $false

        foreach ($tok in $tokens) {
            if ($tok -eq '--recursive') {
                $hasRecursive = $true
            }
            elseif ($tok -eq '--force') {
                $hasForce = $true
            }
            elseif ($tok -match '^-[a-zA-Z]+$') {
                if ($tok -match '[rR]') { $hasRecursive = $true }
                if ($tok -match 'f') { $hasForce = $true }
            }
        }

        if ($hasRecursive -and $hasForce) {
            return $true
        }
    }
    return $false
}

function Test-PowerShellDestructiveRemove {
    param([string]$Command)

    # Validated Remove-Item aliases on this system: rm, ri, del, erase, rd, rmdir
    $pattern = '(?i)\b(Remove-Item|rm|ri|del|erase|rd|rmdir)\b(?:(?!;|\r|\n).)*-Recurse\b'
    return [bool]([regex]::Match($Command, $pattern).Success)
}

try {
    $rawInput = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($rawInput)) {
        exit 0
    }

    $hookInput = $rawInput | ConvertFrom-Json -ErrorAction Stop

    $toolName = $hookInput.tool_name
    $command = $hookInput.tool_input.command

    if ([string]::IsNullOrWhiteSpace($toolName) -or [string]::IsNullOrWhiteSpace($command)) {
        exit 0
    }

    $isDestructive = $false

    if ($toolName -eq 'Bash') {
        $isDestructive = Test-BashDestructiveRm -Command $command
    }
    elseif ($toolName -eq 'PowerShell') {
        $isDestructive = Test-PowerShellDestructiveRemove -Command $command
    }

    if ($isDestructive) {
        $reason = 'Recursive/destructive dosya silme komutu proje güvenlik politikası tarafından engellendi.'
        $payload = [ordered]@{
            hookSpecificOutput = [ordered]@{
                permissionDecision = 'deny'
            }
            systemMessage = $reason
        }
        $json = $payload | ConvertTo-Json -Depth 5 -Compress
        [Console]::Error.WriteLine($json)
        exit 2
    }

    exit 0
}
catch {
    # Fail-open: never block on a parsing/unexpected error, never print
    # stack traces or echo the raw input back out.
    exit 0
}
