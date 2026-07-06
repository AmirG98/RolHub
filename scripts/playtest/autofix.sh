#!/usr/bin/env bash
# Intenta un autofix para un finding autofixable usando Claude Code headless,
# y abre un PR DRAFT con el fix linkeado al issue. Nunca mergea.
#
# Env: ANTHROPIC_API_KEY, GITHUB_TOKEN (PAT), GITHUB_REPOSITORY,
#      AUTOFIXABLE_JSON (array [{fingerprint, issue}]), FINDING_INDEX.
set -euo pipefail

# Seleccionar el finding por índice de la matriz (cap de 2 → índices 0 y 1)
COUNT=$(echo "$AUTOFIXABLE_JSON" | jq 'length')
if [ "$FINDING_INDEX" -ge "$COUNT" ]; then
  echo "No hay finding en el índice $FINDING_INDEX (total: $COUNT). Nada que hacer."
  exit 0
fi

FINGERPRINT=$(echo "$AUTOFIXABLE_JSON" | jq -r ".[$FINDING_INDEX].fingerprint")
ISSUE=$(echo "$AUTOFIXABLE_JSON" | jq -r ".[$FINDING_INDEX].issue")
BRANCH="autofix/${FINGERPRINT}"

echo "Autofix para fingerprint=$FINGERPRINT (issue #$ISSUE) → branch $BRANCH"

# Skip si ya existe la branch o un PR para este fingerprint
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "La branch $BRANCH ya existe — skip (no duplicar)."
  exit 0
fi

# Extraer el finding completo del reporte para dar contexto al fix
FINDING=$(jq -c --arg fp "$FINGERPRINT" \
  '[.sessions[].findings[] | select(.fingerprint == $fp)][0]' \
  playtest-results/report.json)

if [ "$FINDING" = "null" ] || [ -z "$FINDING" ]; then
  echo "No se encontró el finding $FINGERPRINT en el reporte."
  exit 0
fi

SUMMARY=$(echo "$FINDING" | jq -r '.summary')
FILES=$(echo "$FINDING" | jq -r '.suspected_files // [] | join(", ")')

git config user.name "rolhub-autofix[bot]"
git config user.email "autofix@rol-hub.com"
git checkout -b "$BRANCH"

# Prompt acotado para Claude Code headless
PROMPT=$(cat <<EOF
Un agente de playtesting detectó este bug en RolHub:

Resumen: ${SUMMARY}
Archivos sospechosos: ${FILES}
Evidencia completa:
${FINDING}

Arreglá SOLO este bug. No refactorices ni toques nada más. Si el fix amerita
un test, agregalo o ajustá uno existente en __tests__/. Mantené el estilo del
código circundante. No cambies el comportamiento de otras rutas.
EOF
)

# Claude Code headless (si está disponible en el runner). Instalación:
npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 || true

if command -v claude >/dev/null 2>&1; then
  echo "$PROMPT" | claude -p --dangerously-skip-permissions --max-turns 20 || {
    echo "claude-code falló o no hizo cambios"
  }
else
  echo "claude-code no disponible en el runner — se abre issue-comment en vez de PR"
  gh issue comment "$ISSUE" --body "🤖 Autofix no pudo ejecutar claude-code en el runner. Fix manual requerido." || true
  exit 0
fi

# ¿Hubo cambios?
if git diff --quiet && git diff --cached --quiet; then
  echo "El autofix no produjo cambios."
  gh issue comment "$ISSUE" --body "🤖 El autofix corrió pero no produjo cambios. Requiere atención manual." || true
  exit 0
fi

# Verificación local mínima antes de abrir el PR
npx tsc --noEmit || { echo "tsc falló tras el autofix — no abro PR"; exit 0; }
npx vitest run || { echo "tests fallaron tras el autofix — no abro PR"; exit 0; }

git add -A
git commit -m "fix(autofix): ${SUMMARY}

Autofix automático para el finding del playtest.
Fixes #${ISSUE}

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin "$BRANCH"

gh pr create \
  --draft \
  --title "[autofix] ${SUMMARY}" \
  --body "Autofix automático para #${ISSUE} (fingerprint \`${FINGERPRINT}\`).

⚠️ **Requiere revisión humana** — generado por el nightly playtest, no mergear sin revisar.

Fixes #${ISSUE}" \
  --label autofix \
  --head "$BRANCH" \
  --base main || echo "gh pr create falló (¿PAT sin permisos?)"

echo "PR draft abierto para $BRANCH"
