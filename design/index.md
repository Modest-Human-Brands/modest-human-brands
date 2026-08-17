# Modest Human Brands — Design Guidelines

Design specifications extracted from the **Landing** page (5760 × 21944 px).

---

## Color Palette

### Primary / Brand

| Swatch | Hex       | Tailwind Token | Usage                                |
| ------ | --------- | -------------- | ------------------------------------ |
|        | `#FFFFFF` | `white`        | Primary text on dark, light surfaces |
|        | `#191919` | `dark-400`     | Page background, dark surfaces       |
|        | `#000000` | `black`        | CTA button fill, strokes/borders     |

### Accent / Semantic

| Swatch | Hex       | Tailwind Token | Usage                       |
| ------ | --------- | -------------- | --------------------------- |
|        | `#5945EA` | `accent-500`   | Accent stroke / interactive |
|        | `#6672FF` | `accent-400`   | Light accent / hover states |
|        | `#4533CC` | `accent-600`   | Dark accent                 |
|        | `#66C1FF` | `info-400`     | Info / link highlights      |
|        | `#47A8EB` | `info-500`     | Info primary                |
|        | `#338ECC` | `info-600`     | Info dark                   |
|        | `#66FFB6` | `success-400`  | Success / CTA glow          |
|        | `#47EB9C` | `success-500`  | Success primary             |
|        | `#33CC83` | `success-600`  | Success dark                |
|        | `#FFCF6B` | `warning-400`  | Warning                     |
|        | `#FFB83D` | `warning-500`  | Warning primary             |
|        | `#FF9F1A` | `warning-600`  | Warning dark                |
|        | `#FF6680` | `alert-400`    | Alert / error               |
|        | `#EB4864` | `alert-500`    | Alert primary               |
|        | `#CC334D` | `alert-600`    | Alert dark                  |

### Neutrals

| Swatch | Hex       | Tailwind Token | Usage                             |
| ------ | --------- | -------------- | --------------------------------- |
|        | `#8D8D8D` | `light-400`    | Body / descriptive text (muted)   |
|        | `#B4B4B4` | `light-500`    | Light strokes / dividers          |
|        | `#D9D9D9` | `light-600`    | Placeholder shapes, light borders |
|        | `#2B2B2B` | `dark-500`     | Dark card surfaces                |
|        | `#3D3D3D` | `dark-600`     | Secondary dark fills              |

---

## Typography

**Font Family:** Exo 2 — used exclusively throughout the design. Tailwind tokens: `font-main`, `font-sub`.

### Type Scale

| Level      | Weight              | Size (px) | Tailwind Class        | Line Height | Usage                              |
| ---------- | ------------------- | --------- | --------------------- | ----------- | ---------------------------------- |
| Display    | Semi-bold           | 56 px     | `text-5xl`            | Auto        | Hero headline                      |
| Heading 1  | Semi-bold           | 40 px     | `text-3xl`            | Auto        | Section CTA headline               |
| Heading 2  | Semi-bold           | 32 px     | `text-2xl`            | Auto        | Feature section titles             |
| Subheading | Semi-bold           | 20 px     | `text-lg`             | 1.4         | Feature labels, nav items          |
| Body       | Semi-bold           | 16 px     | `text-base`           | 1.5         | Nav links, footer links, body text |
| Body Small | Semi-bold / Regular | 14 px     | `text-sm` / `text-xs` | Auto        | Feature bullet lists, detail text  |
| Caption    | Light               | 14 px     | `text-xs`             | Auto        | Copyright notice                   |

### Typography Rules

- **Single typeface system** — Exo 2 for all text; hierarchy expressed through size and weight only.
- **Weights in use:** Light (`font-light`, 300), Regular (default, 400), Semi-bold (`font-semi-bold`, 500).
- **Letter spacing:** 0% across all sizes (default tracking).
- White text (`white`) on dark backgrounds (`dark-400`).
- Muted body text uses `light-400` for secondary information.

---

## Spacing System

Base values mapped to Tailwind utility classes:

| Tailwind Class      | Value (px) | Usage                          |
| ------------------- | ---------- | ------------------------------ |
| `space-1` / `gap-1` | 4 px       | Tight gaps, icon+label spacing |
| `space-2` / `gap-2` | 8 px       | Small padding                  |
| `[10px]`            | 10 px      | Medium gap (arbitrary)         |
| `space-3` / `gap-3` | 12 px      | Standard padding               |
| `space-4` / `gap-4` | 16 px      | Body text line height base     |
| `space-6` / `gap-6` | 24 px      | Large spacing                  |
| `space-8` / `gap-8` | 32 px      | Section padding                |

### Spacing Patterns (from index.vue)

| Pattern            | Tailwind Classes | Design Value                        | Usage                |
| ------------------ | ---------------- | ----------------------------------- | -------------------- |
| Hero top           | `pt-24 md:pt-32` | 96–128 px                           | Navigation clearance |
| Hero bottom        | `pb-32`          | 128 px                              | Section gap          |
| Feature section    | `py-24`          | 96 px × 2 = 192 px                  | Section padding      |
| Card inner padding | `p-6` / `p-8`    | 24–32 px                            | Content spacing      |
| Footer             | `px-6 py-12`     | 24–48 px horizontal, 48 px vertical | Layout bounds        |
| CTA card           | `p-12 md:p-20`   | 48–80 px                            | Responsive padding   |

---

## Corner Radius

| Tailwind Class | Value (px) | Usage                          |
| -------------- | ---------- | ------------------------------ |
| `rounded-md`   | 8 px       | Cards, containers              |
| `rounded-lg`   | 12 px      | Larger cards                   |
| `rounded-xl`   | 16 px      | Feature cards                  |
| `[14px]`       | 14 px      | Exact design match (arbitrary) |
| `rounded-full` | 9999 px    | Pill buttons, badges           |

---

## Buttons

### CTA Button (Primary / Filled)

- **Classes:** `bg-white text-black font-semi-bold rounded-xl px-8 py-4 text-base shadow-lg shadow-white/20 hover:scale-105 transition`
- **Padding:** `px-8 py-4` (32 px horizontal × 16 px vertical) or `px-10 py-5` for larger CTA variants
- **Gap:** `gap-2` (8 px icon + label spacing)
- **Text:** Exo 2 Semi-bold, `text-base` / `text-lg`, `text-black` / `text-white`
- **Radius:** `rounded-xl` (16 px) for buttons, `rounded-full` (9999 px) for pills/badges

### Secondary Button (Outlined)

- **Classes:** `border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 rounded-xl px-8 py-4 text-base font-semi-bold`
- **Padding:** Same as primary (`px-8 py-4`)
- **Text:** `text-white`

---

## Effects

| Effect        | Tailwind Classes                                                                     | Usage                                |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| Drop Shadow   | `shadow-lg shadow-white/20 hover:shadow-white/40`                                    | Card elevation, interactive elements |
| Blur          | `blur-3xl`                                                                           | Background glow effects              |
| Backdrop Blur | `backdrop-blur-sm`                                                                   | Glass-morphism cards                 |
| Gradient Text | `bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent` | Accent headings                      |
| Opacity Hover | `hover:scale-105 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10`       | Card hover states                    |

---

## Layout Patterns

### Page Structure

- **Canvas width:** 5760 px (desktop)
- **Content max-width:** `max-w-7xl` (~80 rem / ~1280 px at base 16 px)
- **Root layout:** Responsive grid with responsive padding (`px-6`)

### Section Anatomy

| Section  | Height / Padding | Tailwind Classes                                                   | Notes                                     |
| -------- | ---------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| Hero     | Full viewport    | `h-screen pt-24 md:pt-32 pb-32`                                    | Background particles + centered content   |
| Features | ~192 px vertical | `py-24 max-w-7xl px-6`                                             | 3-column grid (`grid-cols-3`)             |
| Platform | ~192 px vertical | `py-24 max-w-7xl px-6`                                             | Two-column layout, bordered card          |
| Stats    | ~192 px vertical | `py-24 max-w-7xl px-6`                                             | 4-column grid (`grid-cols-4`)             |
| CTA      | ~192 px vertical | `py-24 max-w-7xl px-6`                                             | Large bordered card with background image |
| Footer   | ~96 px vertical  | `border-t border-white/10 py-12 px-6 bg-black/50 backdrop-blur-sm` | 4-column layout                           |

### Grid Conventions

| Pattern       | Tailwind Classes                                    | Usage                           |
| ------------- | --------------------------------------------------- | ------------------------------- |
| Feature cards | `grid gap-6 md:grid-cols-2 lg:grid-cols-3`          | Responsive 1→2→3 columns        |
| Stat cards    | `grid gap-6 md:grid-cols-2 lg:grid-cols-4`          | Responsive 1→2→4 columns        |
| Footer        | `grid gap-12 md:grid-cols-4` (col-span-2 for brand) | 4-column with wide brand column |

### Auto-Layout Conventions

- **Vertical stacks:** `space-y-*` / `gap-*` for spacing between items
- **Horizontal rows:** `flex gap-2` for icon+label, `flex gap-4` for social icons
- **Counter-axis alignment:** `items-center justify-center` for buttons and icon bars

---

## Iconography & Media

| Element              | Design Size (px) | Tailwind Classes                         | Usage                    |
| -------------------- | ---------------- | ---------------------------------------- | ------------------------ |
| Social icons         | 40 × 40 px       | `size-10` / `h-10 w-10` + `rounded-full` | Footer social row        |
| Feature card icon    | 56 × 56 px       | `h-14 w-14` + `rounded-xl`               | Feature module icons     |
| Capability item icon | 40 × 40 px       | `h-10 w-10` + `rounded-lg`               | Platform capability list |
| Stat card icon       | 48 × 48 px       | `h-12 w-12` + `rounded-full`             | Stats section icons      |
| Icon text size       | —                | `text-3xl` / `text-2xl` / `text-xl`      | Inside icon containers   |

### Media Patterns

- **Background images:** Full-bleed at content width (`size-full object-cover`) behind hero and CTA sections
- **Feature card backgrounds:** Hover-reveal with overlay (`opacity-0 group-hover:opacity-100 bg-gradient-to-br from-black/90 via-black/80 to-black/70`)
- **Decorative elements:** Radial gradients (`bg-[radial-gradient(circle_at_30%_50%,rgba(72,254,167,0.03),transparent_50%)]`), blurred circles (`h-96 w-96 rounded-full bg-white/20 blur-3xl`)

---

## Design Principles

1. **Dark-first aesthetic** — `dark-400` (`#191919`) base with `white` typography; editorial feel.
2. **Restrained palette** — Neutral grays (`light-400` / `light-500`) dominate; `accent-500` (`#5945EA`) purple accent used sparingly for interactive cues.
3. **Single-family typography** — Exo 2 throughout (`font-main`); hierarchy via size (`text-*`) and weight (`font-*`) only.
4. **Pill-shaped interactive elements** — Buttons and badges use `rounded-full` (9999 px).
5. **Full-bleed media sections** — Background images span content width (`size-full object-cover`) to create visual breaks.
6. **Generous vertical rhythm** — Tall sections with ample whitespace (`py-24`) between content blocks.
