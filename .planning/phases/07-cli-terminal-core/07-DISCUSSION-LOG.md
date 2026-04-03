# Phase 7: CLI Terminal Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 07-cli-terminal-core
**Areas discussed:** Terminal page experience, Welcome banner & prompt style, Resume filesystem tree

---

## Terminal Page Experience

| Option                | Description                                                           | Selected |
| --------------------- | --------------------------------------------------------------------- | -------- |
| Full-screen takeover  | Terminal fills entire viewport, header hides/collapses                |          |
| Terminal below header | Header stays visible with nav, terminal fills remaining space         |          |
| Contained terminal    | Terminal in styled container/card with padding and site frame visible |          |

**User's choice:** Terminal below header
**Notes:** Site navigation stays accessible, terminal fills remaining vertical space

---

### Width

| Option                  | Description                             | Selected |
| ----------------------- | --------------------------------------- | -------- |
| Edge-to-edge            | Terminal spans full width, no margins   |          |
| Site-width with margins | Same max-width container as other pages |          |
| Slight inset            | Nearly full-width with small padding    |          |

**User's choice:** Site-width with margins
**Notes:** Consistent with the rest of the site layout

---

### Focus Behavior

| Option               | Description                                              | Selected |
| -------------------- | -------------------------------------------------------- | -------- |
| Click-anywhere focus | Clicking anywhere in terminal container focuses xterm.js |          |
| Claude decides       | Let implementation determine best focus behavior         |          |

**User's choice:** Click-anywhere focus
**Notes:** Natural terminal behavior

---

### Resize Behavior

| Option        | Description                                       | Selected |
| ------------- | ------------------------------------------------- | -------- |
| Reflow to fit | xterm.js fit addon, columns adjust on resize      |          |
| Fixed columns | Lock to 80 columns, horizontal scroll if narrower |          |

**User's choice:** Reflow to fit (Recommended)
**Notes:** Standard terminal behavior

---

## Welcome Banner & Prompt Style

### Banner Style

| Option            | Description                                             | Selected |
| ----------------- | ------------------------------------------------------- | -------- |
| Name as ASCII art | Big ASCII text of name using ANSI Shadow font           |          |
| Minimal intro     | No ASCII art, just welcome line with version/name       |          |
| Tech-themed art   | Small terminal/computer ASCII art box with welcome text |          |

**User's choice:** Tech-themed art
**Notes:** Box-drawing characters around nicktag.tech and interactive resume

---

### Terminal Theme (User-initiated)

**User's input:** Terminal should use "Dark Modern" by default to stand out from the site theme. Users set terminal theme via `$CLITHEME` variable. `help` command documents `$CLITHEME`.

---

### Theme Scope

| Option               | Description                                                  | Selected |
| -------------------- | ------------------------------------------------------------ | -------- |
| Site themes          | Reuse same 9 curated themes from Phase 5, mapped to xterm.js |          |
| Terminal-only themes | Separate set of terminal-specific color schemes              |          |

**User's choice:** Site themes (Recommended)
**Notes:** One theme system, consistent naming across site and terminal

---

### Banner Color

| Option           | Description                                            | Selected |
| ---------------- | ------------------------------------------------------ | -------- |
| Theme-colored    | Box border and text use terminal theme's accent colors |          |
| Plain monochrome | White/gray box and text                                |          |

**User's choice:** Theme-colored
**Notes:** Ties banner to whichever $CLITHEME is active

---

### Subtitle

| Option                    | Description                                              | Selected |
| ------------------------- | -------------------------------------------------------- | -------- |
| Role tagline              | e.g., "Senior Software Engineer — interactive portfolio" |          |
| Just 'interactive resume' | Minimal subtitle                                         |          |
| Claude decides            | Let implementation pick                                  |          |

**User's choice:** Just 'interactive resume'
**Notes:** Keep it minimal

---

### Post-Banner Hints

| Option                 | Description                                 | Selected |
| ---------------------- | ------------------------------------------- | -------- |
| Help hint only         | Just "Type help for available commands."    |          |
| Help + filesystem hint | "Type help for commands, or try: ls ~/work" |          |
| No hints               | Just banner and prompt                      |          |

**User's choice:** Help + filesystem hint
**Notes:** Nudges users toward the resume content

---

### Prompt Coloring

**User's choice:** Colored segments (recommended default applied)
**Notes:** nick (green), @ (gray), nicktag.tech (cyan), path (yellow), $ (white) — classic colorized bash prompt. User was focused on the $CLITHEME decision; colored segments applied as recommended default.

---

## Resume Filesystem Tree

### Top-Level Structure

| Option            | Description                                            | Selected |
| ----------------- | ------------------------------------------------------ | -------- |
| By resume section | ~/work, ~/education, ~/skills, ~/projects, ~/about.txt |          |
| Flat & minimal    | ~/career, ~/projects, ~/README.txt                     |          |
| Claude decides    | Let implementation design the tree                     |          |

**User's choice:** By resume section
**Notes:** Maps to traditional resume sections

---

### Work Directory Structure

| Option                           | Description                                                 | Selected |
| -------------------------------- | ----------------------------------------------------------- | -------- |
| Company folders with role files  | ~/work/company/ contains role.txt, projects.txt per company |          |
| Company folders with single file | One file per company with everything                        |          |
| Nested by role                   | Company > role title folders for multiple roles             |          |

**User's choice:** Nested by role
**Notes:** Supports multiple roles at the same company

---

### File Content Format

| Option                  | Description                                              | Selected |
| ----------------------- | -------------------------------------------------------- | -------- |
| Structured with headers | Colored section headers (Role, Period, Team, Highlights) |          |
| Plain prose             | Natural paragraph text                                   |          |
| Claude decides          | Let implementation pick best format                      |          |

**User's choice:** Structured with headers
**Notes:** Easy to scan in terminal with colored labels

---

### Data Source

| Option                  | Description                                             | Selected |
| ----------------------- | ------------------------------------------------------- | -------- |
| JSON data file          | Single resumeData.json, filesystem generated at runtime |          |
| TypeScript objects      | Typed resume data in .ts files                          |          |
| Hardcoded in filesystem | Filesystem tree defined as nested object literal        |          |

**User's choice:** JSON data file (Recommended)
**Notes:** Easy to update, single source of truth. User has resume in LaTeX format at ~/Code/Resume/CompletedResumes/DirectorEngineeringResume-31626.tex to parse during implementation.

---

## Claude's Discretion

- xterm.js configuration and addon selection
- Command parser architecture
- Virtual filesystem implementation approach
- Tab completion algorithm
- localStorage schema
- Banner box-drawing art details
- Internal structure of ~/education, ~/skills, ~/projects
- Terminal font size and line height
- $CLITHEME to xterm.js ITheme mapping

## Deferred Ideas

- **ssh Easter egg (CLI-20):** Requires AWS infrastructure — defer to future milestone
- **resume formatted summary (CLI-19):** Defer to backlog item
