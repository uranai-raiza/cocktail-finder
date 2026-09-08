# 家飲みカクテルファインダー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, no-build HTML/CSS/JS web app where checking owned liquor/mixer ingredients instantly filters a recipe list down to cocktails that can be made right now.

**Architecture:** Pure-function core (ingredient master data, cocktail data, subset-match filter, HTML-string renderers) fully covered by Node's built-in test runner, plus a thin browser-only glue script (`script.js`) that wires fetch + DOM events and is verified manually in a browser. This refines the spec's flat `script.js` into four testable modules (`data/ingredients.js`, `data/cocktails.json`, `filter.js`, `render.js`) — same behavior and file set otherwise, better testability.

**Tech Stack:** Vanilla HTML/CSS/JS (ES modules, no bundler), Node.js built-in test runner (`node --test`) for unit tests, Node's built-in `http` module for a zero-dependency local dev server.

**Spec:** `D:\AI-Generated\家飲みカクテルファインダー\docs\superpowers\specs\2026-09-08-cocktail-finder-design.md`

## Global Constraints

- No backend, no database, no build tool, no npm dependencies (Node built-ins only).
- Data lives in static files (`data/ingredients.js`, `data/cocktails.json`).
- Ingredient master list is exactly the 18 items from the spec (8 liquors + 10 mixers) — see spec for exact Japanese labels.
- Cocktail data is exactly the 26 recipes listed in the spec.
- Ice/sugar/salt are never checkable ingredients; they may appear only in a recipe's displayed `ingredients` list.
- Responsive breakpoint: 768px (spec).
- All commits use plain `git commit -m` with the standard Co-Authored-By/Claude-Session trailer already used in this repo's first commit.

---

## File Structure

```
D:\AI-Generated\家飲みカクテルファインダー\
├── package.json
├── serve.js
├── index.html
├── style.css
├── script.js
├── data/
│   ├── ingredients.js
│   └── cocktails.json
├── filter.js
├── render.js
└── tests/
    ├── ingredients.test.js
    ├── cocktails.test.js
    ├── filter.test.js
    └── render.test.js
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `serve.js`

**Interfaces:**
- Produces: `npm test` runs `node --test tests/`. `npm run dev` runs `node serve.js`, a zero-dependency static file server on port 5173 serving the project root, defaulting `/` to `/index.html`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cocktail-finder",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "dev": "node serve.js"
  }
}
```

- [ ] **Step 2: Create `serve.js`**

```js
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const PORT = 5173;
const ROOT = process.cwd();
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = join(ROOT, decodeURIComponent(urlPath));
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/ で起動しました`);
});
```

- [ ] **Step 3: Verify syntax and package.json validity**

Run: `node --check serve.js && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'));console.log('ok')"`
Expected: no output from `--check` (means OK), then `ok` printed.

- [ ] **Step 4: Commit**

```bash
git add package.json serve.js
git commit -m "$(cat <<'EOF'
Add project scaffolding (package.json, dev server)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 2: Ingredient master data

**Files:**
- Create: `data/ingredients.js`
- Test: `tests/ingredients.test.js`

**Interfaces:**
- Produces: `export const INGREDIENTS` — array of `{ id: string, label: string, category: 'liquor' | 'mixer' }`, 18 entries total (8 `liquor`, 10 `mixer`), all `id` values unique.

- [ ] **Step 1: Write the failing test**

Create `tests/ingredients.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { INGREDIENTS } from '../data/ingredients.js';

test('18種類の材料が定義されている', () => {
  assert.equal(INGREDIENTS.length, 18);
});

test('お酒が8種類、割り材が10種類', () => {
  const liquors = INGREDIENTS.filter((i) => i.category === 'liquor');
  const mixers = INGREDIENTS.filter((i) => i.category === 'mixer');
  assert.equal(liquors.length, 8);
  assert.equal(mixers.length, 10);
});

test('idはすべて一意', () => {
  const ids = INGREDIENTS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('各材料はid・label・categoryを持つ', () => {
  for (const ing of INGREDIENTS) {
    assert.equal(typeof ing.id, 'string');
    assert.equal(typeof ing.label, 'string');
    assert.ok(ing.category === 'liquor' || ing.category === 'mixer');
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/ingredients.test.js`
Expected: FAIL — cannot find module `../data/ingredients.js`

- [ ] **Step 3: Write `data/ingredients.js`**

```js
export const INGREDIENTS = [
  { id: 'gin', label: 'ジン', category: 'liquor' },
  { id: 'vodka', label: 'ウォッカ', category: 'liquor' },
  { id: 'rum', label: 'ラム', category: 'liquor' },
  { id: 'tequila', label: 'テキーラ', category: 'liquor' },
  { id: 'whisky', label: 'ウイスキー', category: 'liquor' },
  { id: 'tripleSec', label: 'トリプルセック', category: 'liquor' },
  { id: 'campari', label: 'カンパリ', category: 'liquor' },
  { id: 'coffeeLiqueur', label: 'コーヒーリキュール', category: 'liquor' },
  { id: 'soda', label: '炭酸水', category: 'mixer' },
  { id: 'tonic', label: 'トニックウォーター', category: 'mixer' },
  { id: 'gingerAle', label: 'ジンジャーエール', category: 'mixer' },
  { id: 'cola', label: 'コーラ', category: 'mixer' },
  { id: 'orangeJuice', label: 'オレンジジュース', category: 'mixer' },
  { id: 'grapefruitJuice', label: 'グレープフルーツジュース', category: 'mixer' },
  { id: 'pineappleJuice', label: 'パイナップルジュース', category: 'mixer' },
  { id: 'lemonLime', label: 'レモン/ライム果汁', category: 'mixer' },
  { id: 'grenadine', label: 'グレナデンシロップ', category: 'mixer' },
  { id: 'milk', label: 'ミルク', category: 'mixer' },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/ingredients.test.js`
Expected: PASS (4/4 tests)

- [ ] **Step 5: Commit**

```bash
git add data/ingredients.js tests/ingredients.test.js
git commit -m "$(cat <<'EOF'
Add ingredient master data (18 items)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 3: Cocktail recipe data

**Files:**
- Create: `data/cocktails.json`
- Test: `tests/cocktails.test.js`

**Interfaces:**
- Consumes: `INGREDIENTS` from `data/ingredients.js` (Task 2) — used only by the test, to cross-check `requiredIngredients` ids are valid.
- Produces: `data/cocktails.json` — a JSON array of 26 objects: `{ id: string, name: string, base: string, requiredIngredients: string[], ingredients: {name: string, amount: string}[], steps: string[] }`. `requiredIngredients` entries are always ids from `INGREDIENTS`.

- [ ] **Step 1: Write the failing test**

Create `tests/cocktails.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INGREDIENTS } from '../data/ingredients.js';

const cocktails = JSON.parse(
  readFileSync(new URL('../data/cocktails.json', import.meta.url), 'utf8')
);
const validIds = new Set(INGREDIENTS.map((i) => i.id));

test('26種類のカクテルが定義されている', () => {
  assert.equal(cocktails.length, 26);
});

test('各カクテルは必須フィールドを持つ', () => {
  for (const c of cocktails) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.name, 'string');
    assert.equal(typeof c.base, 'string');
    assert.ok(Array.isArray(c.requiredIngredients) && c.requiredIngredients.length >= 1);
    assert.ok(Array.isArray(c.ingredients) && c.ingredients.length >= 1);
    assert.ok(Array.isArray(c.steps) && c.steps.length >= 1);
  }
});

test('requiredIngredientsは材料マスタに存在するidのみ', () => {
  for (const c of cocktails) {
    for (const id of c.requiredIngredients) {
      assert.ok(validIds.has(id), `${c.name} の requiredIngredients に未知のid: ${id}`);
    }
  }
});

test('idはすべて一意', () => {
  const ids = cocktails.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cocktails.test.js`
Expected: FAIL — cannot read `data/cocktails.json` (ENOENT)

- [ ] **Step 3: Write `data/cocktails.json`**

```json
[
  {
    "id": "gin-tonic",
    "name": "ジントニック",
    "base": "gin",
    "requiredIngredients": ["gin", "tonic"],
    "ingredients": [
      { "name": "ジン", "amount": "45ml" },
      { "name": "トニックウォーター", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷をたっぷり入れる",
      "ジンを注ぐ",
      "トニックウォーターで満たし、軽くステアする"
    ]
  },
  {
    "id": "gin-buck",
    "name": "ジンバック",
    "base": "gin",
    "requiredIngredients": ["gin", "gingerAle", "lemonLime"],
    "ingredients": [
      { "name": "ジン", "amount": "45ml" },
      { "name": "ジンジャーエール", "amount": "適量" },
      { "name": "レモン/ライム果汁", "amount": "5ml" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷、ジン、レモン/ライム果汁を入れる",
      "ジンジャーエールで満たし、軽くステアする"
    ]
  },
  {
    "id": "gin-rickey",
    "name": "ジンリッキー",
    "base": "gin",
    "requiredIngredients": ["gin", "soda", "lemonLime"],
    "ingredients": [
      { "name": "ジン", "amount": "45ml" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "レモン/ライム果汁", "amount": "15ml" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷とレモン/ライム果汁、ジンを入れる",
      "炭酸水で満たし、軽くステアする"
    ]
  },
  {
    "id": "orange-blossom",
    "name": "オレンジブロッサム",
    "base": "gin",
    "requiredIngredients": ["gin", "orangeJuice"],
    "ingredients": [
      { "name": "ジン", "amount": "30ml" },
      { "name": "オレンジジュース", "amount": "45ml" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れる",
      "ジンとオレンジジュースを注ぎ、よくステアする"
    ]
  },
  {
    "id": "gin-fizz",
    "name": "ジンフィズ",
    "base": "gin",
    "requiredIngredients": ["gin", "lemonLime", "soda"],
    "ingredients": [
      { "name": "ジン", "amount": "45ml" },
      { "name": "レモン果汁", "amount": "20ml" },
      { "name": "砂糖", "amount": "小さじ1" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "シェイカーにジン・レモン果汁・砂糖・氷を入れてよく振る",
      "氷を入れたグラスに注ぎ、炭酸水で満たす"
    ]
  },
  {
    "id": "vodka-tonic",
    "name": "ウォッカトニック",
    "base": "vodka",
    "requiredIngredients": ["vodka", "tonic"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "トニックウォーター", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷をたっぷり入れる",
      "ウォッカを注ぐ",
      "トニックウォーターで満たし、軽くステアする"
    ]
  },
  {
    "id": "screwdriver",
    "name": "スクリュードライバー",
    "base": "vodka",
    "requiredIngredients": ["vodka", "orangeJuice"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "オレンジジュース", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ウォッカを注ぐ",
      "オレンジジュースで満たし、軽くステアする"
    ]
  },
  {
    "id": "salty-dog",
    "name": "ソルティドッグ",
    "base": "vodka",
    "requiredIngredients": ["vodka", "grapefruitJuice"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "グレープフルーツジュース", "amount": "適量" },
      { "name": "塩(あれば、グラスの縁に)", "amount": "少々" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスの縁に塩をつける(あれば)",
      "氷を入れ、ウォッカとグレープフルーツジュースを注いでステアする"
    ]
  },
  {
    "id": "vodka-soda",
    "name": "ウォッカソーダ",
    "base": "vodka",
    "requiredIngredients": ["vodka", "soda"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ウォッカを注ぐ",
      "炭酸水で満たし、軽くステアする"
    ]
  },
  {
    "id": "moscow-mule",
    "name": "モスコミュール",
    "base": "vodka",
    "requiredIngredients": ["vodka", "gingerAle", "lemonLime"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "レモン/ライム果汁", "amount": "15ml" },
      { "name": "ジンジャーエール", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷、ウォッカ、レモン/ライム果汁を入れる",
      "ジンジャーエールで満たし、軽くステアする"
    ]
  },
  {
    "id": "vodka-pine",
    "name": "ウォッカパイン",
    "base": "vodka",
    "requiredIngredients": ["vodka", "pineappleJuice"],
    "ingredients": [
      { "name": "ウォッカ", "amount": "45ml" },
      { "name": "パイナップルジュース", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ウォッカを注ぐ",
      "パイナップルジュースで満たし、軽くステアする"
    ]
  },
  {
    "id": "cuba-libre",
    "name": "キューバリブレ",
    "base": "rum",
    "requiredIngredients": ["rum", "cola", "lemonLime"],
    "ingredients": [
      { "name": "ラム", "amount": "45ml" },
      { "name": "レモン/ライム果汁", "amount": "10ml" },
      { "name": "コーラ", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷、ラム、レモン/ライム果汁を入れる",
      "コーラで満たし、軽くステアする"
    ]
  },
  {
    "id": "rum-tonic",
    "name": "ラムトニック",
    "base": "rum",
    "requiredIngredients": ["rum", "tonic"],
    "ingredients": [
      { "name": "ラム", "amount": "45ml" },
      { "name": "トニックウォーター", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ラムを注ぐ",
      "トニックウォーターで満たし、軽くステアする"
    ]
  },
  {
    "id": "dark-and-stormy",
    "name": "ダークアンドストーミー",
    "base": "rum",
    "requiredIngredients": ["rum", "gingerAle", "lemonLime"],
    "ingredients": [
      { "name": "ラム", "amount": "45ml" },
      { "name": "レモン/ライム果汁", "amount": "10ml" },
      { "name": "ジンジャーエール", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷、ラム、レモン/ライム果汁を入れる",
      "ジンジャーエールで満たし、軽くステアする"
    ]
  },
  {
    "id": "rum-pine",
    "name": "ラムパイン",
    "base": "rum",
    "requiredIngredients": ["rum", "pineappleJuice"],
    "ingredients": [
      { "name": "ラム", "amount": "45ml" },
      { "name": "パイナップルジュース", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ラムを注ぐ",
      "パイナップルジュースで満たし、軽くステアする"
    ]
  },
  {
    "id": "tequila-sunrise",
    "name": "テキーラサンライズ",
    "base": "tequila",
    "requiredIngredients": ["tequila", "orangeJuice", "grenadine"],
    "ingredients": [
      { "name": "テキーラ", "amount": "45ml" },
      { "name": "オレンジジュース", "amount": "適量" },
      { "name": "グレナデンシロップ", "amount": "10ml" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、テキーラとオレンジジュースを注いでステアする",
      "グレナデンシロップをグラスの中心に静かに沈める"
    ]
  },
  {
    "id": "tequila-tonic",
    "name": "テキーラトニック",
    "base": "tequila",
    "requiredIngredients": ["tequila", "tonic"],
    "ingredients": [
      { "name": "テキーラ", "amount": "45ml" },
      { "name": "トニックウォーター", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、テキーラを注ぐ",
      "トニックウォーターで満たし、軽くステアする"
    ]
  },
  {
    "id": "paloma",
    "name": "パロマ",
    "base": "tequila",
    "requiredIngredients": ["tequila", "grapefruitJuice", "soda", "lemonLime"],
    "ingredients": [
      { "name": "テキーラ", "amount": "45ml" },
      { "name": "グレープフルーツジュース", "amount": "60ml" },
      { "name": "レモン/ライム果汁", "amount": "10ml" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "塩(あれば、グラスの縁に)", "amount": "少々" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷、テキーラ、グレープフルーツジュース、レモン/ライム果汁を入れてステアする",
      "炭酸水で満たし、軽く混ぜる"
    ]
  },
  {
    "id": "tequila-soda",
    "name": "テキーラソーダ",
    "base": "tequila",
    "requiredIngredients": ["tequila", "soda"],
    "ingredients": [
      { "name": "テキーラ", "amount": "45ml" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、テキーラを注ぐ",
      "炭酸水で満たし、軽くステアする"
    ]
  },
  {
    "id": "highball",
    "name": "ハイボール",
    "base": "whisky",
    "requiredIngredients": ["whisky", "soda"],
    "ingredients": [
      { "name": "ウイスキー", "amount": "30ml" },
      { "name": "炭酸水", "amount": "90ml目安" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷をたっぷり入れる",
      "ウイスキーを注ぎ、軽く混ぜて冷やす",
      "よく冷えた炭酸水を静かに注ぎ、軽く1回だけステアする"
    ]
  },
  {
    "id": "whisky-coke",
    "name": "ウイスキーコーク",
    "base": "whisky",
    "requiredIngredients": ["whisky", "cola"],
    "ingredients": [
      { "name": "ウイスキー", "amount": "30ml" },
      { "name": "コーラ", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ウイスキーを注ぐ",
      "コーラで満たし、軽くステアする"
    ]
  },
  {
    "id": "whisky-ginger",
    "name": "ウイスキージンジャー",
    "base": "whisky",
    "requiredIngredients": ["whisky", "gingerAle"],
    "ingredients": [
      { "name": "ウイスキー", "amount": "30ml" },
      { "name": "ジンジャーエール", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、ウイスキーを注ぐ",
      "ジンジャーエールで満たし、軽くステアする"
    ]
  },
  {
    "id": "campari-soda",
    "name": "カンパリソーダ",
    "base": "campari",
    "requiredIngredients": ["campari", "soda"],
    "ingredients": [
      { "name": "カンパリ", "amount": "45ml" },
      { "name": "炭酸水", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、カンパリを注ぐ",
      "炭酸水で満たし、軽くステアする"
    ]
  },
  {
    "id": "campari-orange",
    "name": "カンパリオレンジ",
    "base": "campari",
    "requiredIngredients": ["campari", "orangeJuice"],
    "ingredients": [
      { "name": "カンパリ", "amount": "45ml" },
      { "name": "オレンジジュース", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、カンパリを注ぐ",
      "オレンジジュースで満たし、軽くステアする"
    ]
  },
  {
    "id": "kahlua-milk",
    "name": "カルーアミルク",
    "base": "coffeeLiqueur",
    "requiredIngredients": ["coffeeLiqueur", "milk"],
    "ingredients": [
      { "name": "コーヒーリキュール", "amount": "45ml" },
      { "name": "ミルク", "amount": "適量" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスに氷を入れ、コーヒーリキュールを注ぐ",
      "ミルクで満たし、よくステアする"
    ]
  },
  {
    "id": "margarita",
    "name": "マルガリータ",
    "base": "tequila",
    "requiredIngredients": ["tequila", "tripleSec", "lemonLime"],
    "ingredients": [
      { "name": "テキーラ", "amount": "40ml" },
      { "name": "トリプルセック", "amount": "15ml" },
      { "name": "レモン/ライム果汁", "amount": "15ml" },
      { "name": "塩(あれば、グラスの縁に)", "amount": "少々" },
      { "name": "氷", "amount": "適量" }
    ],
    "steps": [
      "グラスの縁を果汁で湿らせ、塩をつける(あれば)",
      "シェイカーにテキーラ・トリプルセック・レモン/ライム果汁・氷を入れてよく振る",
      "グラスに注ぐ"
    ]
  }
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/cocktails.test.js`
Expected: PASS (4/4 tests)

- [ ] **Step 5: Commit**

```bash
git add data/cocktails.json tests/cocktails.test.js
git commit -m "$(cat <<'EOF'
Add cocktail recipe data (26 recipes)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 4: Filter logic

**Files:**
- Create: `filter.js`
- Test: `tests/filter.test.js`

**Interfaces:**
- Produces: `export function filterCocktails(cocktails, checkedIds)` — `cocktails` is an array shaped like the entries in `data/cocktails.json` (each with `.requiredIngredients: string[]`), `checkedIds` is a `Set<string>`. Returns the subarray (original order preserved) of cocktails whose every `requiredIngredients` entry is present in `checkedIds`.

- [ ] **Step 1: Write the failing test**

Create `tests/filter.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCocktails } from '../filter.js';

const sample = [
  { id: 'a', requiredIngredients: ['gin', 'tonic'] },
  { id: 'b', requiredIngredients: ['vodka', 'orangeJuice'] },
  { id: 'c', requiredIngredients: ['gin'] },
];

test('チェックが空なら何も一致しない', () => {
  const result = filterCocktails(sample, new Set());
  assert.deepEqual(result.map((c) => c.id), []);
});

test('必要材料の一部しか無ければ除外される', () => {
  const result = filterCocktails(sample, new Set(['gin']));
  assert.deepEqual(result.map((c) => c.id), ['c']);
});

test('必要材料がすべて揃っていれば含まれる', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'c']);
});

test('必要以上の材料を持っていても含まれる', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic', 'vodka', 'orangeJuice', 'rum']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'b', 'c']);
});

test('元の配列順を保って返す', () => {
  const result = filterCocktails(sample, new Set(['gin', 'tonic', 'vodka', 'orangeJuice']));
  assert.deepEqual(result.map((c) => c.id), ['a', 'b', 'c']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/filter.test.js`
Expected: FAIL — cannot find module `../filter.js`

- [ ] **Step 3: Write `filter.js`**

```js
export function filterCocktails(cocktails, checkedIds) {
  return cocktails.filter((cocktail) =>
    cocktail.requiredIngredients.every((id) => checkedIds.has(id))
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/filter.test.js`
Expected: PASS (5/5 tests)

- [ ] **Step 5: Commit**

```bash
git add filter.js tests/filter.test.js
git commit -m "$(cat <<'EOF'
Add filterCocktails subset-match logic

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 5: Render functions

**Files:**
- Create: `render.js`
- Test: `tests/render.test.js`

**Interfaces:**
- Consumes: `INGREDIENTS` shape from Task 2 (`{id, label, category}`), cocktail shape from Task 3 (`{id, name, ingredients: {name, amount}[], steps: string[]}`).
- Produces:
  - `export function renderIngredientChecklist(ingredients)` → HTML string with a `<fieldset>` per category (`legend` text: `お酒` for `liquor`, `割り材` for `mixer`), each containing one `<label>` + `<input type="checkbox" id="ing-<id>" value="<id>">` per ingredient.
  - `export function renderRecipeCard(cocktail)` → HTML string: `<article>` containing an `<h3>` with the name, a `<ul>` of `<li>${name} ${amount}</li>` for ingredients, and an `<ol>` of `<li>${step}</li>` for steps.
  - `export function renderRecipeList(cocktails)` → HTML string: if `cocktails.length === 0`, a `<p class="empty-state">作れるカクテルがありません。材料を追加してみてください</p>`; otherwise the concatenation of `renderRecipeCard(c)` for each cocktail.

- [ ] **Step 1: Write the failing test**

Create `tests/render.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIngredientChecklist, renderRecipeCard, renderRecipeList } from '../render.js';

const ingredients = [
  { id: 'gin', label: 'ジン', category: 'liquor' },
  { id: 'tonic', label: 'トニックウォーター', category: 'mixer' },
];

const cocktail = {
  id: 'gin-tonic',
  name: 'ジントニック',
  requiredIngredients: ['gin', 'tonic'],
  ingredients: [
    { name: 'ジン', amount: '45ml' },
    { name: 'トニックウォーター', amount: '適量' },
  ],
  steps: ['グラスに氷を入れる', 'ジンを注ぐ'],
};

test('renderIngredientChecklistは各材料のチェックボックスを含む', () => {
  const html = renderIngredientChecklist(ingredients);
  assert.match(html, /id="ing-gin"/);
  assert.match(html, /id="ing-tonic"/);
  assert.match(html, /ジン/);
  assert.match(html, /トニックウォーター/);
});

test('renderIngredientChecklistはカテゴリ見出しを含む', () => {
  const html = renderIngredientChecklist(ingredients);
  assert.match(html, /お酒/);
  assert.match(html, /割り材/);
});

test('renderRecipeCardは名前・材料・手順を含む', () => {
  const html = renderRecipeCard(cocktail);
  assert.match(html, /ジントニック/);
  assert.match(html, /45ml/);
  assert.match(html, /グラスに氷を入れる/);
});

test('renderRecipeListは空配列でempty-stateを返す', () => {
  const html = renderRecipeList([]);
  assert.match(html, /作れるカクテルがありません/);
});

test('renderRecipeListは各カクテルのカードを連結する', () => {
  const html = renderRecipeList([cocktail, { ...cocktail, id: 'x', name: '別のカクテル' }]);
  assert.match(html, /ジントニック/);
  assert.match(html, /別のカクテル/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/render.test.js`
Expected: FAIL — cannot find module `../render.js`

- [ ] **Step 3: Write `render.js`**

```js
const CATEGORY_LABELS = { liquor: 'お酒', mixer: '割り材' };

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderIngredientChecklist(ingredients) {
  const categories = ['liquor', 'mixer'];
  return categories
    .map((category) => {
      const items = ingredients.filter((i) => i.category === category);
      const options = items
        .map(
          (i) => `
        <label class="ingredient-option">
          <input type="checkbox" id="ing-${i.id}" value="${i.id}">
          ${escapeHtml(i.label)}
        </label>`
        )
        .join('');
      return `
      <fieldset class="ingredient-group">
        <legend>${CATEGORY_LABELS[category]}</legend>
        ${options}
      </fieldset>`;
    })
    .join('');
}

export function renderRecipeCard(cocktail) {
  const ingredientItems = cocktail.ingredients
    .map((i) => `<li>${escapeHtml(i.name)} ${escapeHtml(i.amount)}</li>`)
    .join('');
  const stepItems = cocktail.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  return `
    <article class="recipe-card">
      <h3>${escapeHtml(cocktail.name)}</h3>
      <ul class="recipe-ingredients">${ingredientItems}</ul>
      <ol class="recipe-steps">${stepItems}</ol>
    </article>`;
}

export function renderRecipeList(cocktails) {
  if (cocktails.length === 0) {
    return '<p class="empty-state">作れるカクテルがありません。材料を追加してみてください</p>';
  }
  return cocktails.map(renderRecipeCard).join('');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/render.test.js`
Expected: PASS (5/5 tests)

- [ ] **Step 5: Commit**

```bash
git add render.js tests/render.test.js
git commit -m "$(cat <<'EOF'
Add HTML render functions for checklist and recipe cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 6: HTML shell and CSS

**Files:**
- Create: `index.html`
- Create: `style.css`
- Test: `tests/index-html.test.js`

**Interfaces:**
- Produces: `index.html` with `<div id="ingredient-list"></div>`, `<div id="recipe-list"></div>`, and `<script type="module" src="script.js"></script>`. `style.css` provides layout, linked from `index.html`.

- [ ] **Step 1: Write the failing test**

Create `tests/index-html.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('材料チェックリストとレシピ一覧の入れ物を持つ', () => {
  assert.match(html, /id="ingredient-list"/);
  assert.match(html, /id="recipe-list"/);
});

test('script.jsをモジュールとして読み込む', () => {
  assert.match(html, /<script[^>]*type="module"[^>]*src="script\.js"/);
});

test('style.cssを読み込む', () => {
  assert.match(html, /<link[^>]*href="style\.css"/);
});

test('viewportメタタグを持つ(レスポンシブ対応)', () => {
  assert.match(html, /name="viewport"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/index-html.test.js`
Expected: FAIL — cannot read `index.html` (ENOENT)

- [ ] **Step 3: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>家飲みカクテルファインダー</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>家飲みカクテルファインダー</h1>
    <p>手持ちのお酒・割り材にチェックを入れると、今すぐ作れるカクテルが分かります。</p>
  </header>
  <main class="app-layout">
    <section class="ingredients-panel" aria-label="材料チェックリスト">
      <h2>持っている材料</h2>
      <div id="ingredient-list"></div>
    </section>
    <section class="recipes-panel" aria-label="作れるカクテル一覧">
      <h2>作れるカクテル</h2>
      <div id="recipe-list"></div>
    </section>
  </main>
  <script type="module" src="script.js"></script>
</body>
</html>
```

- [ ] **Step 4: Write `style.css`**

```css
:root {
  color-scheme: light dark;
  --gap: 1rem;
  --border: #ccc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Hiragino Kaku Gothic ProN", sans-serif;
  line-height: 1.5;
}

header {
  padding: 1rem;
  text-align: center;
}

.app-layout {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: 0 1rem 2rem;
}

.ingredients-panel,
.recipes-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.ingredient-group {
  border: none;
  margin: 0 0 1rem;
  padding: 0;
}

.ingredient-group legend {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.ingredient-option {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.75rem 0.5rem 0;
}

#recipe-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.recipe-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.recipe-card h3 {
  margin-top: 0;
}

.empty-state {
  opacity: 0.7;
}

@media (min-width: 768px) {
  .app-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .ingredients-panel {
    flex: 0 0 320px;
    position: sticky;
    top: 1rem;
  }

  .recipes-panel {
    flex: 1;
  }

  #recipe-list {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/index-html.test.js`
Expected: PASS (4/4 tests)

- [ ] **Step 6: Commit**

```bash
git add index.html style.css tests/index-html.test.js
git commit -m "$(cat <<'EOF'
Add HTML shell and responsive CSS layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```

---

### Task 7: App glue script + manual browser QA

**Files:**
- Create: `script.js`

**Interfaces:**
- Consumes: `INGREDIENTS` (Task 2), `data/cocktails.json` (Task 3, fetched at runtime), `filterCocktails` (Task 4), `renderIngredientChecklist`/`renderRecipeList` (Task 5), `#ingredient-list`/`#recipe-list` DOM containers (Task 6).
- Produces: on page load, renders the checklist and the full recipe list (nothing checked yet → empty state); on any checkbox change, re-filters and re-renders `#recipe-list`.

- [ ] **Step 1: Write `script.js`**

```js
import { INGREDIENTS } from './data/ingredients.js';
import { filterCocktails } from './filter.js';
import { renderIngredientChecklist, renderRecipeList } from './render.js';

const ingredientListEl = document.getElementById('ingredient-list');
const recipeListEl = document.getElementById('recipe-list');

function getCheckedIds() {
  const checked = ingredientListEl.querySelectorAll('input[type="checkbox"]:checked');
  return new Set(Array.from(checked).map((el) => el.value));
}

async function main() {
  ingredientListEl.innerHTML = renderIngredientChecklist(INGREDIENTS);

  let cocktails;
  try {
    const res = await fetch('./data/cocktails.json');
    cocktails = await res.json();
  } catch {
    recipeListEl.innerHTML = '<p class="empty-state">データを読み込めませんでした</p>';
    return;
  }

  function render() {
    const checkedIds = getCheckedIds();
    recipeListEl.innerHTML = renderRecipeList(filterCocktails(cocktails, checkedIds));
  }

  ingredientListEl.addEventListener('change', render);
  render();
}

main();
```

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: console prints `http://localhost:5173/ で起動しました`. Leave it running.

- [ ] **Step 3: Manual browser QA (PC width)**

Open `http://localhost:5173/` in a browser at a normal desktop width. Verify:
- Ingredient checklist and recipe panel are side by side.
- With nothing checked, the recipe panel shows "作れるカクテルがありません。材料を追加してみてください".
- Check "ジン" and "トニックウォーター" → "ジントニック" appears with its ingredients and steps; no cocktail requiring other ingredients appears.
- Check "ウイスキー" and "炭酸水" additionally → "ハイボール" also appears, "ジントニック" still shown.
- Uncheck "トニックウォーター" → "ジントニック" disappears, "ハイボール" remains.
- Open browser devtools console: confirm no errors logged.

- [ ] **Step 4: Manual browser QA (mobile width)**

Resize the browser (or devtools device toolbar) to ~375px width. Verify:
- Ingredient checklist and recipe panel stack vertically (no horizontal scrollbar, no overlapping text).
- Repeat the same check/uncheck flow from Step 3 and confirm the same filtering behavior.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all tests across `tests/ingredients.test.js`, `tests/cocktails.test.js`, `tests/filter.test.js`, `tests/render.test.js`, `tests/index-html.test.js` PASS.

- [ ] **Step 6: Commit**

```bash
git add script.js
git commit -m "$(cat <<'EOF'
Wire up app: fetch data, render checklist/recipes, filter on change

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018VyERkDSkXkRNgi8FbSqYa
EOF
)"
```
