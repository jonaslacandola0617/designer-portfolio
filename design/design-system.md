# REGISTER
### Design System — Jonas Lacandola / Visual Design
Prepared for: design.jonasl.online · Public site + Admin CMS · Prototype v1

---

## 1. Creative Direction

**Concept.** The site is built around a single idea: *the portfolio is a publication, not a folder.* Every project is exhibited the way a magazine exhibits a feature — numbered, dated, art-directed on its own terms — rather than uploaded into a repeating card. The internal name for the system is **Register**, a deliberate double meaning: the *registration mark* a printer uses to align plates, and the *register* — a ledger — that a studio keeps of its own work. Both ideas recur visually throughout.

**Philosophy.** Restraint is the differentiator. The site uses one accent color, one grid, one signature mark — and spends its "loud" moment entirely on the work itself. Site chrome (navigation, type, structure) stays quiet and disciplined in three neutrals and one ink; the work samples are where color and energy live, because that's the honest division of labor on a real design studio's site: the studio's own branding is a frame, not the art.

**Tone.** Meticulous, curious, confident, unbothered. Copy is short, declarative, and specific to Jonas rather than generic portfolio filler — no fake stats, no invented awards, no "passionate creative" language.

**How this avoids the generic AI-portfolio look.** No rounded cards, no bento grid, no gradient-blob hero, no "Hi, I'm Jonas." The homepage opens as a magazine cover, not an app landing page. Every featured project on the homepage has a hand-built, non-repeating composition (large/small, paired, full-bleed) rather than a looped card template. The one thing every generated portfolio reaches for — a soft neutral background with a warm terracotta accent — is deliberately avoided; the accent here is a saturated cobalt ("proof ink"), conceptually tied to the blue pencil a print production artist uses to mark up a proof, which reads as considered rather than default.

---

## 2. Identity System

### 2.1 Color

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F2F0EA` | Primary background |
| `--paper-2` | `#E9E5D9` | Recessed surface (hover rows, admin backgrounds) |
| `--paper-3` | `#FBFAF7` | Raised surface (cards, dropzones) |
| `--ink` | `#111111` | Primary text, primary borders |
| `--ink-soft` | `#23221F` | Body copy on paper (slightly softer than pure ink) |
| `--graphite` | `#6E6B65` | Secondary text, metadata |
| `--graphite-2` | `#96938B` | Tertiary text, disabled/inactive state |
| `--line` | `#D8D4CB` | Structural rules, borders |
| `--line-soft` | `#E4E1D8` | Faint dividers (table rows, index lists) |
| `--accent` | `#2438D6` | **"Proof Cobalt"** — the annotation ink |
| `--accent-deep` | `#16247E` | Accent hover / pressed state |
| `--accent-tint` | `#E4E7FB` | Accent background wash (rare use) |

**Accent usage rule:** the accent behaves like a pen mark, never a fill. It appears on active nav underlines, the status dot, the registration mark, one rule per poster artboard, focus outlines, and link hovers — never as a background color for large areas or buttons.

**Work palette (artboards only):** the mock project artwork throughout the prototype intentionally uses a *wider*, warmer palette (burnt orange, acid yellow, sun gold, clay terracotta, deep teal, plum) that never touches the site chrome. This is the visual argument for Jonas's range: the studio frame is disciplined; the work inside it isn't limited to one palette.

### 2.2 Typography

| Role | Family | Notes |
|---|---|---|
| Display / Editorial | **Fraunces** (serif, wght 300–900, italic available) | Headlines, project titles, pull-quotes. Used bold/black at large sizes with tight tracking, not soft/romantic. |
| Interface / Body | **Space Grotesk** (wght 300–700) | Navigation, body copy, buttons, descriptions. Carries most of the "digital" personality. |
| Metadata / Data | **IBM Plex Mono** (wght 400–500) | Eyebrows, project numbers, dates, categories, form labels — always uppercase, always tracked out. |

**Scale** (fluid via `clamp()`, desktop reference in parentheses):

| Token | Fluid value | ~Desktop |
|---|---|---|
| `--fs-xl` | `clamp(3.4rem, 2.3rem + 6.6vw, 8rem)` | 128px |
| `--fs-display` | `clamp(2.5rem, 1.9rem + 3.4vw, 4.75rem)` | 76px |
| `--fs-section` | `clamp(1.7rem, 1.45rem + 1.4vw, 2.6rem)` | 42px |
| `--fs-lead` | `clamp(1.15rem, 1.05rem + 0.5vw, 1.5rem)` | 24px |
| `--fs-body` | `1.0625rem` | 17px |
| `--fs-meta` | `0.76rem` | 12px, mono, uppercase |
| `--fs-micro` | `0.66rem` | 10.5px |

**Rules of use:** line breaks in headlines are always manual, never left to wrap — every headline in the prototype is hand-broken at a meaningful word boundary. Separators use a forward slash (`/`) consistently as the system's connective device, never a middle dot. Body copy line length is capped near 40–58 characters via `max-width: Nch`.

### 2.3 Spacing & Grid

8px base unit: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 176`px (tokens `--sp-1` … `--sp-11`).

Layout grid: **12 columns**, fluid gutter (`clamp(20px, 4.4vw, 72px)` outer margin, `clamp(14px, 2vw, 28px)` inter-column gap). Compositions are built by deliberately unbalanced column spans (e.g. 7/12 image + 4/12 text, offset by a 1-column margin) rather than evenly split halves — see the three alternating "selected work" layouts in the prototype (`wr-a`, `wr-b`, `wr-c`, `wr-d`) for the reusable pattern set.

### 2.4 Surfaces, Borders, Corners

- Corner radius: **0px everywhere**, with the sole exception of the status dot and a few circular UI marks (registration mark, availability dot), which are intentionally circular, not rounded-rectangle.
- Borders: 1px hairlines in `--line` for structure; 1.4–2px in `--ink` for interactive framing (buttons, the JL mark, segmented controls). No drop shadows on content; the only shadow-like effect is the blurred backdrop behind the fixed header.
- Images are always rectangular (4:5 portrait, 16:9, 1:1, or 16:10 — no cropping to circles or rounded corners).

### 2.5 Signature Devices

Two devices carry the brand, used consistently and sparingly:

1. **The registration mark** — a small crosshair-in-circle (⊕), the print-production symbol for aligning color plates. Appears as the section-number icon on the homepage, and centered in the page-transition veil on every route change. It is never used decoratively elsewhere.
2. **The archive number** — every project carries a three-digit number (001–009) that persists across every context it appears in (homepage, archive grid, archive index, project detail, admin table). It is a real index, not a decorative label.

A tertiary mark, the **JL monogram** (a square-bracketed "JL"), is used only as an identity stamp: header logo, footer, browser favicon, and the admin login/brand mark.

### 2.6 Motion

| Token | Value | Use |
|---|---|---|
| `--dur-ui` | 200ms | Hover, focus, toggle states |
| `--dur-editorial` | 650–700ms | Page-transition veil, artboard hover-scale, headline load-in |
| Easing | `cubic-bezier(.22,1,.36,1)` | All editorial motion |

**Principle:** one orchestrated moment per context, not scattered animation. The homepage has exactly one load sequence (the name rising into place); everything else responds only to direct interaction — hover, click, route change. Route changes use a single full-bleed ink "veil" wipe rather than per-section fade-ins. `prefers-reduced-motion: reduce` collapses all durations to 1ms.

### 2.7 Cursor & Hover Language

Over any project artwork, the system cursor is suppressed locally and replaced with a pill-shaped "View Project" label that tracks the pointer (desktop / fine-pointer only; untouched on touch devices). Hover on an artboard scales the image 1 → 1.035 with no rotation or tilt. Hover on a nav link draws an underline in from the left. Hover on a discipline row (homepage §03) reveals a floating thumbnail and tints the row label with the accent color.

### 2.8 Accessibility

Body text maintains ≥4.5:1 contrast against paper; metadata (graphite on paper) is checked against the smaller AA threshold used for larger/bold labels. All interactive elements have a visible 2px accent focus ring (`:focus-visible`). The mobile menu moves focus to its close control on open and closes on `Escape`. Motion fully respects `prefers-reduced-motion`. Navigation order is identical to visual order; nothing essential is revealed only on hover (hover states are enhancements — the same information/links are reachable via the Index View, the standard link list, and keyboard focus).

---

## 3. Component Inventory

For developer hand-off. Each component is implemented as CSS custom-property-driven markup with no build step in the prototype; a production build can lift these directly into a component library.

| Component | States / Variants | Notes |
|---|---|---|
| **Header / Primary Nav** | default, active route, mobile (<760px) | Fixed, blurred backdrop; collapses to a single "Menu" trigger on mobile |
| **Mobile Menu Overlay** | open / closed | Full-screen, large type, closes on Escape or link click |
| **Registration Mark (icon)** | static | Inline SVG, currentColor stroke — reused in section heads + transition veil |
| **JL Monogram** | header / footer / favicon / admin | Same mark, three sizes |
| **Page Transition Veil** | covering / leaving | Full-viewport ink panel, wipes between routes |
| **View Cursor** | visible / hidden | Pointer-following label, fine-pointer only |
| **Artboard** | 9 palette variants (`art-1`…`art-9`), aspect variants (portrait / wide / square) | Placeholder system for real artwork; production swaps in real images/video at the same aspect ratios |
| **Artboard Frame** | default / hover | Wraps an artboard with title + metadata caption |
| **Work Row** | 4 layout variants (a/b/c/d) | Reusable alternating composition set for "selected work" |
| **Section Head** | — | Registration mark + numbered eyebrow + optional link |
| **Discipline Row** | default / hover | Typographic index row with reveal-on-hover thumbnail |
| **Statement / Pull-quote** | — | Large italic Fraunces block |
| **Button (primary)** | default / hover | 1px ink border, inverts on hover, optional arrow glyph |
| **Link (underline)** | default / hover | Mono, uppercase, animated underline |
| **Category Filter** | active / inactive | Typographic buttons with live counts, not pill chips |
| **View Toggle** | Visual / Index | Two-state segmented control |
| **Archive Visual Grid** | responsive spans | 12-col grid with a tuned span rhythm (8/4, 4/8, 6/6, 5/7, 12) |
| **Archive Index Row** | default / hover | Catalogue-style numbered table row |
| **Project Meta Row** | — | 4-up label/value block (Category/Year, Role, Discipline, Status) |
| **Project Narrative Block** | — | 3-up Brief / Direction / Result columns |
| **Project Gallery** | 3 slot layouts (a/b/c) | Large + offset-small + full-width crop |
| **Next Project Link** | hover | Title slides on hover, paired thumbnail |
| **Capability Row** (About) | — | Numbered two-column index |
| **Footer** | — | Ink-reversed, oversized wordmark, nav + social lists |
| **— Admin —** | | |
| **Admin Header / Tabs** | active tab | Persistent across all admin screens |
| **Stat Block** | — | Plain number + label, no charts |
| **Project Table Row** | Published / Draft, hover-revealed actions | Status shown as dot + label, never a colorful badge |
| **Chip Select** (category) | active/inactive | Square, bordered, not a rounded pill |
| **Segmented Control** (status / featured) | 2-state | Shared component with the public-site view toggle |
| **Dropzone** (cover image) | empty / filled | Click-to-upload with live client-side preview |
| **Gallery Reorder Grid** | — | Drag-handle affordance + delete, add tile |
| **Media Tile** | hover reveal | Replace / Delete actions on hover |
| **Toast** | show / hide | Bottom-centered, 2.2s auto-dismiss, used for Duplicate/Archive/Save/Publish feedback |

---

## 4. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **Desktop** (>1024px) | Full asymmetric grid compositions; header nav inline |
| **Tablet** (~1024px) | Asymmetry retained; some 3-column narrative/meta blocks may tighten but stay multi-column |
| **~860–900px** | Home "selected work" rows and project meta/narrative blocks collapse to a single column; discipline-row hover thumbnails are dropped (no hover on touch) |
| **~760px** | Header nav replaced by the full-screen mobile menu |
| **~700px** | Archive visual grid forces full-width items (fluid spans are no longer readable at this width); archive index table drops the Year/View columns |
| **Mobile** (~390px) | Edge-to-edge artwork, large type preserved via fluid `clamp()` scales rather than fixed breakpoint font sizes, single-column throughout |

---

## 5. Handoff Notes for Development

- All tokens are CSS custom properties on `:root` in both prototype files — lift them directly into whatever styling approach the production stack uses (CSS variables, Tailwind theme, styled-components theme, etc.).
- The prototype's project data lives in a single in-memory JS array (`projects`) that drives the Work Archive and Project Detail views. This is intentionally shaped like the eventual CMS record: `title, slug, category, year, role, discipline, short, brief, direction, result, gallery[]` plus `cover image / featured / status / order` fields modeled in the admin editor. A real backend can drop straight into this shape.
- The nine "artboards" are CSS-only placeholders standing in for real photography/artwork. Production should replace `.art-1`…`.art-9` with real image containers at the same aspect ratios (4:5, 16:10, 1:1, 16:9) so the surrounding layout math doesn't need to change.
- Routing in the prototype is a minimal hash router (`#/`, `#/work`, `#/project/:slug`, `#/about`, `#/contact`) purely to make the static prototype navigable; production should use whatever router the chosen framework provides, preserving the same URL shape.
- Admin authentication, image storage, drag-to-reorder persistence, and all data writes are intentionally unimplemented (per brief) — every affordance is present and styled, but backed by prototype-only JS state and toast confirmations rather than a real API.

