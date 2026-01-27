#!/bin/bash
# Remove agent directories from git tracking

git rm -r --cached .agent .agents .claude .cline .codebuddy .codex .commandcode .continue .crush .cursor .factory .gemini .goose .kilocode .kiro .mcpjam .mux .neovate .opencode .openhands .pi .qoder .qwen .roo .trae .windsurf .zencoder 2>/dev/null || true
git rm -r --cached skills 2>/dev/null || true
git rm -r --cached jest@latest 2>/dev/null || true

echo "Agent directories removed from git tracking. Run 'git commit' to commit the changes."
