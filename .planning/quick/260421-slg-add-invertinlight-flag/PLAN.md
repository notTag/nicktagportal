---
phase: quick
plan: 260421-slg
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/shell/src/types/skills.ts
  - apps/shell/src/assets/main.css
  - apps/shell/src/components/skills/SkillDiamond.vue
  - apps/shell/src/data/techSkills.json
autonomous: false
must_haves:
  truths:
    - 'Skill type supports an `invertInLight?: boolean` flag symmetric to `invertInDark`'
    - "CSS rule inverts flagged icons only when `[data-theme-type='light']` is active"
    - 'SkillDiamond applies the new class conditionally based on `invertInLight`'
    - 'Claude Code entry in techSkills.json is flagged `invertInLight: true`'
  artifacts:
    - path: 'apps/shell/src/types/skills.ts'
      provides: 'Skill type with invertInLight field'
      contains: 'invertInLight'
    - path: 'apps/shell/src/assets/main.css'
      provides: 'Light-theme invert rule'
      contains: "data-theme-type='light'"
    - path: 'apps/shell/src/components/skills/SkillDiamond.vue'
      provides: 'Conditional class binding for skill-icon-invert-light'
      contains: 'skill-icon-invert-light'
    - path: 'apps/shell/src/data/techSkills.json'
      provides: 'claude-code entry flagged invertInLight'
      contains: '"name": "claude-code"'
  key_links: []
---

<objective>
Mirror the existing `invertInDark` pattern with a symmetric `invertInLight` flag so white monochrome
logos (Anthropic's Claude icon) remain visible on the light theme.

Purpose: The Claude Code skill icon (`/icons/skills/claude.svg`) is a white mono glyph. It reads
fine against dark surfaces but disappears on light-theme cards. We need the inverse of the existing
dark-mode flip: invert the icon only when the active theme is light.

Non-goals: do NOT refactor the existing `invertInDark` flag into a union (`invertOn: 'dark' | 'light' | 'both'`).
Two-boolean symmetry is intentional — keeps the data migration to a single-line addition per affected
skill.

Do NOT commit (per user instruction).
</objective>

<context>
Existing pattern:
- `apps/shell/src/types/skills.ts`: `invertInDark?: boolean` on the `Skill` interface.
- `apps/shell/src/assets/main.css`: `[data-theme-type='dark'] img.skill-icon-invert { filter: invert(1) !important; }`.
- `apps/shell/src/components/skills/SkillDiamond.vue`: `:class="{ 'skill-icon-invert': skill.invertInDark }"` on the `<img>`.
- `apps/shell/src/data/techSkills.json`: affected entries include `"invertInDark": true`.

Affected skill: `claude-code` (line ~264 in techSkills.json). Icon is the Anthropic Claude glyph, white mono.
</context>

<tasks>

### Task 1 — Extend Skill type

**Files:** `apps/shell/src/types/skills.ts`
**Action:** Add `invertInLight?: boolean` directly below the existing `invertInDark?: boolean` field.
**Verify:** `grep -n 'invertInLight' apps/shell/src/types/skills.ts` returns one match.
**Done:** Type compiles; no other field changes.

### Task 2 — Add light-theme invert CSS rule

**Files:** `apps/shell/src/assets/main.css`
**Action:** Add a new rule directly below the existing dark-theme rule:

```css
/* Invert mono light-on-light skill icons when the active theme is light.
   Flagged per-skill via `invertInLight: true` in techSkills.json. */
[data-theme-type='light'] img.skill-icon-invert-light {
  filter: invert(1) !important;
}
```

**Verify:** `grep -n 'skill-icon-invert-light' apps/shell/src/assets/main.css` returns one match.
**Done:** Rule parses; co-located with the existing dark rule for discoverability.

### Task 3 — Bind class in SkillDiamond.vue

**Files:** `apps/shell/src/components/skills/SkillDiamond.vue`
**Action:** Extend the `<img>` `:class` binding to include `skill-icon-invert-light` when `skill.invertInLight`
is truthy. Final binding:

```html
:class="{ 'skill-icon-invert': skill.invertInDark, 'skill-icon-invert-light':
skill.invertInLight }"
```

**Verify:** `grep -n 'skill-icon-invert-light' apps/shell/src/components/skills/SkillDiamond.vue` returns one match.
**Done:** Template still compiles; both classes coexist.

### Task 4 — Flag claude-code entry

**Files:** `apps/shell/src/data/techSkills.json`
**Action:** Add `"invertInLight": true` to the `claude-code` entry (currently lacks any invert flag).
**Verify:** `bun -e "const d=require('./apps/shell/src/data/techSkills.json');console.log(d.find(s=>s.name==='claude-code').invertInLight)"` → `true`.
**Done:** JSON still parses; only the claude-code entry changes.

</tasks>

<success_criteria>

- [ ] Type has `invertInLight?: boolean`
- [ ] CSS has `[data-theme-type='light'] img.skill-icon-invert-light` rule with `filter: invert(1) !important`
- [ ] SkillDiamond.vue binds `skill-icon-invert-light` conditional on `skill.invertInLight`
- [ ] `claude-code` entry in techSkills.json has `"invertInLight": true`
- [ ] `bun run build` (or `bun run type-check`) passes
- [ ] No commits created
      </success_criteria>
