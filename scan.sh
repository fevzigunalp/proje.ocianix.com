#!/bin/bash
# Proje Takip - Gunluk Tarama Scripti
# Claude Code ile calistirilir, projeleri tarar ve projects.json'u gunceller

cd /home/fevzi/projects/proje-takip

echo "=== Proje Tarama Basladi: $(date) ==="

# Her projenin son git commit tarihini ve dosya sayisini kontrol et
declare -A FOLDERS
FOLDERS=(
  ["cappadocia-shooting"]="/home/fevzi/projects/Cappadocia_Shooting/"
  ["teklif-kapadokya"]="/home/fevzi/teklif-kapadokya/"
  ["above-cappadocia"]="/home/fevzi/projects/Ocianix/web/above-cappadocia/"
  ["cekimatolyesi-v2"]="/home/fevzi/projects/Ocianix/web/cekimatolyesi-v2/"
  ["premium-agent-studio"]="/home/fevzi/projects/premium-agent-studio/"
  ["ocianix-com"]="/home/fevzi/projects/Ocianix/web/ocianix-com/"
)

SCAN_RESULT="{"
SCAN_RESULT+='"scanDate":"'$(date +%Y-%m-%d)'",'
SCAN_RESULT+='"projects":['

FIRST=true
for ID in "${!FOLDERS[@]}"; do
  DIR="${FOLDERS[$ID]}"
  if [ ! -d "$DIR" ]; then continue; fi

  # Son commit tarihi
  LAST_COMMIT=""
  if [ -d "$DIR/.git" ] || git -C "$DIR" rev-parse --git-dir > /dev/null 2>&1; then
    LAST_COMMIT=$(git -C "$DIR" log -1 --format="%ci" 2>/dev/null | cut -d' ' -f1 || echo "")
  fi

  # Dosya sayilari
  TOTAL_FILES=$(find "$DIR" -type f -not -path '*node_modules*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/out/*' -not -path '*/.astro/*' 2>/dev/null | wc -l)
  SRC_FILES=$(find "$DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.astro" -o -name "*.py" -o -name "*.html" -o -name "*.css" \) -not -path '*node_modules*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' 2>/dev/null | wc -l)
  COMPONENTS=$(find "$DIR" -type f -name "*.tsx" -o -name "*.astro" 2>/dev/null | grep -i -c "component\|Component" 2>/dev/null || echo "0")

  if [ "$FIRST" = true ]; then FIRST=false; else SCAN_RESULT+=","; fi
  SCAN_RESULT+='{"id":"'$ID'","lastCommit":"'$LAST_COMMIT'","totalFiles":'$TOTAL_FILES',"srcFiles":'$SRC_FILES'}'
done

SCAN_RESULT+=']}'

echo "$SCAN_RESULT" > scan-result.json
echo "=== Tarama Tamamlandi ==="
cat scan-result.json
