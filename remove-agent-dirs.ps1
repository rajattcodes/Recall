# PowerShell script to remove agent directories from git tracking

$agentDirs = @(
    ".agent", ".agents", ".claude", ".cline", ".codebuddy", ".codex",
    ".commandcode", ".continue", ".crush", ".cursor", ".factory", ".gemini",
    ".goose", ".kilocode", ".kiro", ".mcpjam", ".mux", ".neovate",
    ".opencode", ".openhands", ".pi", ".qoder", ".qwen", ".roo",
    ".trae", ".windsurf", ".zencoder", "skills", "jest@latest"
)

foreach ($dir in $agentDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir from git tracking..."
        git rm -r --cached $dir 2>$null
    }
}

Write-Host "`nDone! Agent directories removed from git tracking."
Write-Host "Run 'git commit -m `"chore: remove agent directories from tracking`"' to commit the changes."
