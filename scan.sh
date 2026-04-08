#!/bin/bash
# Ocianix Operasyon Merkezi - Otomatik Proje Tarama
# Tüm proje klasörlerini tarar, bilgileri toplar, projects.json'a yazar
# Kullanım: bash scan.sh

PROJECTS_DIR="/mnt/d/8. AI_Projects/1. Ubuntu_Projects"
OUTPUT_FILE="$(dirname "$0")/projects.json"
TODAY=$(date +%Y-%m-%d)

echo "=== Ocianix Proje Tarama: $TODAY ==="

# Collect all project directories
declare -a PROJECT_DIRS=()

# Top-level project folders (skip proje.ocianix.com itself)
for dir in "$PROJECTS_DIR"/*/; do
  name=$(basename "$dir")
  [[ "$name" == *"proje.ocianix.com"* ]] && continue

  # If it has .git or package.json, it's a project
  if [ -d "$dir/.git" ] || [ -f "$dir/package.json" ]; then
    PROJECT_DIRS+=("$dir")
  fi

  # Check sub-projects (e.g., 2.Project_Ocianix/web/*)
  if [ -d "$dir/web" ]; then
    for subdir in "$dir/web"/*/; do
      [ -d "$subdir" ] && PROJECT_DIRS+=("$subdir")
    done
  fi
done

echo "Bulunan proje sayısı: ${#PROJECT_DIRS[@]}"

# Build JSON
echo "[" > "$OUTPUT_FILE"
FIRST=true

for dir in "${PROJECT_DIRS[@]}"; do
  [ ! -d "$dir" ] && continue

  FOLDER_NAME=$(basename "$dir")
  PARENT_NAME=$(basename "$(dirname "$dir")")

  # Generate ID from folder name
  ID=$(echo "$FOLDER_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

  # Project name: clean up folder name
  NAME=$(echo "$FOLDER_NAME" | sed 's/^[0-9]*[._-]*//' | sed 's/Project_//g' | sed 's/_/ /g' | sed 's/-/ /g')
  [ -z "$NAME" ] && NAME="$FOLDER_NAME"

  # Last git commit date
  LAST_COMMIT=""
  if [ -d "$dir/.git" ]; then
    LAST_COMMIT=$(git -C "$dir" log -1 --format="%ci" 2>/dev/null | cut -d' ' -f1)
  fi
  [ -z "$LAST_COMMIT" ] && LAST_COMMIT="$TODAY"

  # First commit date (creation)
  FIRST_COMMIT=$(git -C "$dir" log --reverse --format="%ci" 2>/dev/null | head -1 | cut -d' ' -f1)
  [ -z "$FIRST_COMMIT" ] && FIRST_COMMIT="$TODAY"

  # Description from package.json
  DESC=""
  if [ -f "$dir/package.json" ]; then
    DESC=$(python3 -c "import json; d=json.load(open('$dir/package.json')); print(d.get('description',''))" 2>/dev/null)
  fi

  # Tech stack from package.json dependencies
  STACK="[]"
  if [ -f "$dir/package.json" ]; then
    STACK=$(python3 -c "
import json
try:
    pkg = json.load(open('$dir/package.json'))
    deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
    stack = []
    mapping = {
        'next': 'Next.js', 'react': 'React', 'vue': 'Vue', 'svelte': 'Svelte',
        'astro': 'Astro', '@astrojs/': 'Astro',
        'tailwindcss': 'Tailwind CSS', '@tailwindcss/vite': 'Tailwind CSS',
        'vite': 'Vite', 'typescript': 'TypeScript',
        'express': 'Express', 'fastify': 'Fastify', 'flask': 'Flask',
        '@supabase/supabase-js': 'Supabase', 'firebase': 'Firebase',
        'prisma': 'Prisma', '@prisma/client': 'Prisma',
        'zod': 'Zod', 'framer-motion': 'Framer Motion', 'sharp': 'Sharp',
        'resend': 'Resend', 'stripe': 'Stripe', 'puppeteer': 'Puppeteer',
        'three': 'Three.js', 'd3': 'D3.js',
    }
    for dep in deps:
        for key, val in mapping.items():
            if dep == key or dep.startswith(key):
                if val not in stack:
                    stack.append(val)
    print(json.dumps(stack))
except:
    print('[]')
" 2>/dev/null)
  fi

  # Languages from git
  LANGUAGES="[]"
  if [ -d "$dir/.git" ]; then
    LANGUAGES=$(python3 -c "
import os, json
exts = {}
for root, dirs, files in os.walk('$dir'):
    dirs[:] = [d for d in dirs if d not in ['node_modules','.git','dist','.next','out','.astro']]
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext in ['.ts','.tsx','.js','.jsx','.py','.astro','.vue','.svelte','.html','.css','.scss']:
            exts[ext] = exts.get(ext, 0) + 1
lang_map = {'.ts':'TypeScript','.tsx':'TypeScript','.js':'JavaScript','.jsx':'JavaScript',
            '.py':'Python','.astro':'Astro','.vue':'Vue','.svelte':'Svelte',
            '.html':'HTML','.css':'CSS','.scss':'SCSS'}
langs = list(dict.fromkeys([lang_map[e] for e in sorted(exts, key=exts.get, reverse=True) if e in lang_map]))
print(json.dumps(langs[:5]))
" 2>/dev/null)
  fi

  # File counts
  TOTAL_FILES=$(find "$dir" -type f -not -path '*node_modules*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/out/*' -not -path '*/.astro/*' 2>/dev/null | wc -l)
  SRC_FILES=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.astro" -o -name "*.py" -o -name "*.html" -o -name "*.css" -o -name "*.vue" -o -name "*.svelte" \) -not -path '*node_modules*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' 2>/dev/null | wc -l)
  COMPONENTS=$(find "$dir" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.astro" -o -name "*.vue" -o -name "*.svelte" \) -not -path '*node_modules*' -not -path '*/.git/*' -not -path '*/dist/*' 2>/dev/null | wc -l)

  # Page count (pages directory)
  PAGES=0
  for pages_dir in "$dir/src/pages" "$dir/app" "$dir/pages" "$dir/src/app"; do
    if [ -d "$pages_dir" ]; then
      PAGES=$(find "$pages_dir" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.astro" -o -name "*.html" -o -name "*.vue" \) 2>/dev/null | wc -l)
      break
    fi
  done

  # GitHub remote URL
  REPO_URL=""
  if [ -d "$dir/.git" ]; then
    REPO_URL=$(git -C "$dir" remote get-url origin 2>/dev/null | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
  fi

  # Homepage from package.json
  HOMEPAGE=""
  if [ -f "$dir/package.json" ]; then
    HOMEPAGE=$(python3 -c "import json; d=json.load(open('$dir/package.json')); print(d.get('homepage',''))" 2>/dev/null)
  fi

  # Detect category
  CATEGORY="diger"
  LOWER_NAME=$(echo "$FOLDER_NAME $DESC" | tr '[:upper:]' '[:lower:]')
  [[ "$LOWER_NAME" == *"turizm"* || "$LOWER_NAME" == *"cappadocia"* || "$LOWER_NAME" == *"kapadokya"* || "$LOWER_NAME" == *"tour"* || "$LOWER_NAME" == *"balon"* || "$LOWER_NAME" == *"teklif"* || "$LOWER_NAME" == *"booking"* ]] && CATEGORY="turizm"
  [[ "$LOWER_NAME" == *"studio"* || "$LOWER_NAME" == *"stüdyo"* || "$LOWER_NAME" == *"cekim"* || "$LOWER_NAME" == *"photo"* ]] && CATEGORY="studio"
  [[ "$LOWER_NAME" == *"ocianix.com"* || "$LOWER_NAME" == *"portfolyo"* || "$LOWER_NAME" == *"corporate"* ]] && CATEGORY="kurumsal"
  [[ "$LOWER_NAME" == *"agent"* || "$LOWER_NAME" == *"api"* || "$LOWER_NAME" == *"bot"* || "$LOWER_NAME" == *"automation"* ]] && CATEGORY="yazilim"

  # Detect project type
  PROJ_TYPE="website"
  [[ "$LOWER_NAME" == *"api"* || "$LOWER_NAME" == *"backend"* ]] && PROJ_TYPE="api_backend"
  [[ "$LOWER_NAME" == *"agent"* || "$LOWER_NAME" == *"automation"* || "$LOWER_NAME" == *"bot"* ]] && PROJ_TYPE="automation"
  [[ "$LOWER_NAME" == *"mobile"* || "$LOWER_NAME" == *"app"* ]] && PROJ_TYPE="mobile_app"

  # Determine status based on activity
  STATUS="active"
  if [ -n "$LAST_COMMIT" ]; then
    DAYS_AGO=$(( ($(date +%s) - $(date -d "$LAST_COMMIT" +%s 2>/dev/null || echo $(date +%s))) / 86400 ))
    [ "$DAYS_AGO" -gt 30 ] && STATUS="on_hold"
    [ "$DAYS_AGO" -gt 90 ] && STATUS="archived"
  fi
  [ "$SRC_FILES" -lt 3 ] && STATUS="idea"

  # Progress estimate
  PROGRESS=0
  [ "$SRC_FILES" -gt 0 ] && PROGRESS=10
  [ "$SRC_FILES" -gt 5 ] && PROGRESS=30
  [ "$SRC_FILES" -gt 15 ] && PROGRESS=50
  [ "$SRC_FILES" -gt 30 ] && PROGRESS=65
  [ "$SRC_FILES" -gt 60 ] && PROGRESS=80
  [ "$SRC_FILES" -gt 100 ] && PROGRESS=90

  # Write JSON entry
  [ "$FIRST" = true ] && FIRST=false || echo "," >> "$OUTPUT_FILE"

  cat >> "$OUTPUT_FILE" << ENTRY
  {
    "id": "$ID",
    "name": "$NAME",
    "description": "$DESC",
    "type": "$PROJ_TYPE",
    "category": "$CATEGORY",
    "status": "$STATUS",
    "progress": $PROGRESS,
    "featured": false,
    "highlight": "",
    "url": "$HOMEPAGE",
    "repo": "$REPO_URL",
    "stack": $STACK,
    "languages": $LANGUAGES,
    "tags": [],
    "folder": "$dir",
    "lastActivity": "$LAST_COMMIT",
    "pages": $PAGES,
    "components": $COMPONENTS,
    "totalFiles": $TOTAL_FILES,
    "srcFiles": $SRC_FILES,
    "createdAt": "$FIRST_COMMIT"
  }
ENTRY

  echo "  ✓ $NAME ($SRC_FILES src files, $COMPONENTS components, status: $STATUS)"
done

echo "]" >> "$OUTPUT_FILE"

echo ""
echo "=== Tarama Tamamlandı: $(cat "$OUTPUT_FILE" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))') proje ==="
echo "Çıktı: $OUTPUT_FILE"
