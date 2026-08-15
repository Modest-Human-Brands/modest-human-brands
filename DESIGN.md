# Modest Human Brands — Technical Design System & UI Specifications

This document defines the formal design system, UI tokens, layout structures, component standards, and aesthetic guidelines for the **Modest Human Brands (MHB)** platform — an Autonomous The Project Management Software integrating **MWap**, **MConnect**, **MDoc**, **MCoordinate**, **MSync**, **MMedia**, **MDrive**, and **MAssist**.

---

## 1. Core Architecture & Aesthetic Philosophy

### 1.1 Tech Stack Foundations

- **Core Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 with `<script setup lang="ts">`)
- **Styling**: [TailwindCSS v3](https://tailwindcss.com/) with a custom design configuration (`tailwind.config.ts`)
- **Icons**: `@nuxt/icon` with custom SVG icon collection stored in `app/assets/icons/` using the `local:` namespace prefix
- **State & Forms**: Pinia, `@regle/nuxt` (schema validation)
- **Editor**: Tiptap Editor (`nuxt-tiptap-editor`)
- **Native Desktop & Mobile Targets**: Tauri v2 (`src-tauri`)

### 1.2 Aesthetic Principles

1. **Sleek Dark-First Glassmorphism**: The core UI features a dark-mode base (`#191919`) complimented by semi-transparent container cards (`bg-dark-500/50`, `bg-dark-500/30`), fine 1px structural borders (`border-dark-400`, `border-dark-500`), and subtle radial glowing highlights (`bg-primary-500/20 blur-[40px]`).
2. **High-Contrast Functional Accents**: Primary actions leverage vibrant blue (`#4A85FF`), status indicators use distinct Mint Green (`#48FEA7` Success), Amber (`#FFB83D` Warning), and Red (`#FF4444` Alert).
3. **Fluid Micro-Animations**: Soft hover translations (`hover:-translate-y-0.5` / `hover:-translate-y-1`), scale feedback (`hover:scale-105`), and entrance keyframes (`animate-slide-in`).
4. **Precision Typography**: Geometric clarity powered by the **Exo 2** font family across main and secondary interfaces.

---

## 2. Design Tokens

### 2.1 Color Palette

#### Base & Neutrals

| Token Name    | Tailwind Class | HEX Code  | Usage / Context                                           |
| :------------ | :------------- | :-------- | :-------------------------------------------------------- |
| **Black**     | `black`        | `#000000` | Deepest background vignettes, high-contrast pills         |
| **Dark 400**  | `dark-400`     | `#191919` | Application main body background (`bg-dark-400`)          |
| **Dark 500**  | `dark-500`     | `#2B2B2B` | Card surfaces, inputs, navigation item hovers             |
| **Dark 600**  | `dark-600`     | `#3D3D3D` | Elevated elements, inner shadows, borders                 |
| **Light 400** | `light-400`    | `#8D8D8D` | Muted secondary text, scrollbar track (light mode)        |
| **Light 500** | `light-500`    | `#B4B4B4` | Subtitles, captions, disabled states, placeholder text    |
| **Light 600** | `light-600`    | `#D9D9D9` | High-light border highlights, active scrollbar thumbs     |
| **White**     | `white`        | `#FFFFFF` | Primary headings, active navigation text, contrast badges |

#### Brand & Status Accents

| Category          | Token | Class         | HEX       | Usage                                                   |
| :---------------- | :---- | :------------ | :-------- | :------------------------------------------------------ |
| **Primary Blue**  | 400   | `primary-400` | `#6B9FFF` | Interactive links, active hovers, status text           |
|                   | 500   | `primary-500` | `#4A85FF` | Primary action indicator pills, callouts                |
|                   | 600   | `primary-600` | `#2E6BDF` | Focus states, active edit status                        |
| **Success Mint**  | 400   | `success-400` | `#6FFEC4` | Light status badge text                                 |
|                   | 500   | `success-500` | `#48FEA7` | "Delivered" project status, active trends               |
|                   | 600   | `success-600` | `#2DD985` | Success borders, deep gradient highlights               |
| **Warning Amber** | 400   | `warning-400` | `#FFCF6B` | Caution accents                                         |
|                   | 500   | `warning-500` | `#FFB83D` | "Quotation" status pills, pending notifications         |
|                   | 600   | `warning-600` | `#FF9F1A` | Alert highlights                                        |
| **Alert Red**     | 400   | `alert-400`   | `#FF6B6B` | Critical warnings, hover delete text                    |
|                   | 500   | `alert-500`   | `#FF4444` | Unread notifications, delete buttons, close icons hover |
|                   | 600   | `alert-600`   | `#E62E2E` | Destructive focus states                                |

---

### 2.2 Typography System

- **Primary Font Family**: `"Exo 2"`, `sans-serif` (`font-main`)
- **Secondary Font Family**: `"Exo 2"`, `sans-serif` (`font-sub`)

#### Weight Scale

- `font-light`: `300`
- `font-regular`: `400`
- `font-semi-bold`: `500`
- `font-bold`: `600`

#### Size & Line-Height Scale

| Class       | Font Size           | Line Height          | Application                                        |
| :---------- | :------------------ | :------------------- | :------------------------------------------------- |
| `text-3xs`  | `0.5rem` (`8px`)    | `0.5625rem` (`9px`)  | Micro metadata, compact badges                     |
| `text-2xs`  | `0.625rem` (`10px`) | `0.75rem` (`12px`)   | Timestamps, status indicator labels                |
| `text-xs`   | `0.75rem` (`12px`)  | `0.875rem` (`14px`)  | Form field notes, trend text, secondary captions   |
| `text-sm`   | `0.875rem` (`14px`) | `1.0625rem` (`17px`) | Standard body text, form input labels, navbar text |
| `text-base` | `1rem` (`16px`)     | `1.5rem` (`24px`)    | Main content text, sidebar navigation titles       |
| `text-lg`   | `1.25rem` (`20px`)  | `1.5625rem` (`25px`) | Card titles, section subheadings                   |
| `text-xl`   | `1.5rem` (`24px`)   | `1.875rem` (`30px`)  | Modal titles, feature section headings             |
| `text-2xl`  | `2rem` (`32px`)     | `2.5rem` (`40px`)    | Dashboard greetings, major component titles        |
| `text-3xl`  | `2.5rem` (`40px`)   | `3.125rem` (`50px`)  | Page header titles (`h1`)                          |
| `text-4xl`  | `3rem` (`48px`)     | `3.625rem` (`58px`)  | Large hero headers                                 |
| `text-5xl`  | `3.5rem` (`56px`)   | `4.1875rem` (`67px`) | Display titles                                     |

---

### 2.3 Iconography

The application uses custom SVG icons registered via `@nuxt/icon` with the prefix `local:`. SVGs are located in `app/assets/icons/`.

**Key Icons Available**:
`local:grid`, `local:network`, `local:document`, `local:node`, `local:stream`, `local:hard-drive`, `local:target`, `local:journal`, `local:gravel`, `local:person`, `local:chat`, `local:kanban`, `local:calendar`, `local:map`, `local:cross`, `local:plus`, `local:upload`, `local:chevron-bold`, `local:gear`, `local:email`, `local:phone`, `local:whatsapp`, `local:star`, `local:send`, `local:search`.

**Standard Usage Pattern**:

```vue
<NuxtIcon name="local:grid" class="text-2xl text-white" />
```

---

### 2.4 Border Radii & Elevation Tokens

- **Small**: `rounded-md` (6px) — Small action icons & metric containers
- **Medium**: `rounded-lg` (8px) — Cards (`ProjectCard`), status pill overlays
- **Large**: `rounded-xl` (12px) — Form controls, nav items, dropdowns
- **Extra Large**: `rounded-2xl` (16px) — Main metric panels, form container boxes
- **Pill / Circular**: `rounded-full` — User avatars, active route indicators

---

### 2.5 Micro-Animations & Scrollbars

#### Custom Keyframe Animations

```css
@keyframes slide-in {
  from {
    transform: translateX(-4px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

#### Custom Scrollbar Styling

```css
*::-webkit-scrollbar {
  @apply block size-[6px] bg-light-400 dark:bg-dark-400;
}
*::-webkit-scrollbar-thumb {
  @apply rounded-none bg-dark-600 dark:bg-light-600;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
```

---

## 3. Layout Structures

```
+-------------------------------------------------------------------------------+
| App Root Wrapper Layout (layouts/default.vue)                                |
| Grid Overlay Background (300px grid) + Dark Edge Vignette Gradients          |
|                                                                               |
| +-----------------------+---------------------------------------------------+ |
| | AppNavbar             | Main Content Container                            | |
| | (App Sidebar Shell)   |                                                   | |
| |                       | +-----------------------------------------------+ | |
| | - Logo & Org Name     | | Header / Top Navigation Bar                   | | |
| | - Nav Groups:         | | AppBreadcrumb + AppActivitybar / AppActionbar | | |
| |   * Primary Tabs      | +-----------------------------------------------+ | |
| |   * Secondary Tabs    | | Slot View (NuxtPage)                          | | |
| |                       | | - Dashboard / Module Workspace                | | |
| |                       | | - Responsive Grid Columns                     | | |
| |                       | +-----------------------------------------------+ | |
| +-----------------------+---------------------------------------------------+ |
+-------------------------------------------------------------------------------+
```

### 3.1 Layout Templates

#### 1. Universal Root Layout (`layouts/default.vue`)

Applies the signature background grid pattern overlay:

```html
<div class="pointer-events-none fixed inset-0 z-0">
  <div
    style="background-image: linear-gradient(to right, rgba(72, 254, 167, 0.1) 2px, transparent 2px), linear-gradient(to bottom, rgba(72, 254, 167, 0.1) 2px, transparent 2px); background-size: 300px 300px; background-position: center center;" />
  <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
  <div class="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
</div>
```

#### 2. Standard Navigation Layout (`layouts/navigation.vue`)

- Left fixed sidebar (`AppNavbar`) with responsive collapse state (`md:w-56`).
- Top bar rendering dynamic breadcrumbs (`AppBreadcrumb`) and collaborator activity indicator (`AppActivitybar`).
- Flexible viewport container (`min-h-0 grow overflow-hidden`).

#### 3. Module Header Layout (`layouts/navigation-header.vue`)

Used in rich module dashboards (Dashboard, Connect, Doc, Coordinate, Sync, Drive, Project, Transaction, Compliance).

- Module Header: Large icon, module title (`h1`), description text.
- Actions: Contextual creation trigger button (`AppActionbar`).

---

## 4. Component Rules & Blueprints

### 4.1 Navigation (`AppNavbar.vue`)

- Sidebar displays two primary navigation groups: **Primary** (`dashboard`, `connect`, `doc`, `coordinate`, `sync`, `drive`) and **Secondary** (`project`, `transaction`, `compliance`).
- Active item selection is highlighted using `bg-white/10 text-white` and an animated indicator pill (`animate-slide-in rounded-full bg-primary-500`).

### 4.2 Form Controls (`FormField.vue`)

`FormField` is a self-contained, schema-driven input component that dynamically renders UI based on `schemaType`:

| Schema Type                  | Rendered Element            | Behavior                                                            |
| :--------------------------- | :-------------------------- | :------------------------------------------------------------------ |
| `markdown` / `textarea`      | `<textarea>`                | 4-row expandable box, dark focus rings                              |
| `array<string>`              | Multi-row string inputs     | Includes "Add Item" button and individual delete action             |
| `array<object>`              | Recursive `FormField` stack | Schema blueprint-based object array generator                       |
| `boolean`                    | Checkbox container          | Interactive cursor pointer row                                      |
| `signature`                  | File upload dropzone        | Drag-and-drop or click to upload signature image with preview state |
| `enum:opt1,opt2`             | `<select>` dropdown         | Custom styled dropdown with `local:chevron-bold` overlay            |
| `date` / `time` / `datetime` | Native picker input         | Styled HTML5 date/time pickers                                      |

### 4.3 Content Cards (`ProjectCard.vue`)

- Container features a subtle border (`border-dark-500`) with hover translations (`hover:-translate-y-0.5`).
- Status Pills map directly to status states:
  - **Plan**: `bg-light-500` dot
  - **Quotation**: `bg-warning-500` dot & pill
  - **Shoot**: `bg-primary-400` dot & pill
  - **Edit**: `bg-primary-600` dot & pill
  - **Delivered**: `bg-success-500` dot & pill
- Cover image fallbacks dynamically generate consistent multi-color gradient overlays (`from-primary-600/40`, `from-success-600/40`, etc.) based on string hashing.

### 4.4 Modal Dialogs (`ModalBase.vue`)

- Teleported to `<body>`.
- Dark backdrop backdrop (`bg-black/50`) with backdrop click-to-close handler `@click.self`.
- Dialogue box max width capped at `max-w-[700px]`, background `bg-dark-400`, text `text-white`.
- Close button uses `local:cross` with hover state transition to `hover:text-alert-500`.

---

## 5. Development & Code Conventions

1. **Script Standard**: Always use Vue 3 `<script setup lang="ts">`.
2. **Prop & Emit Typing**: Use explicit TypeScript interface definitions or inline generic declarations (`defineProps<{ ... }>()`, `defineEmits<{ ... }>()`).
3. **Class Structure Order**:
   - Layout & Flexbox/Grid (`flex`, `grid`, `items-center`, `justify-between`)
   - Sizing & Spacing (`size-full`, `w-full`, `px-4`, `py-3`, `gap-2`)
   - Visual Styles (`rounded-xl`, `border border-dark-400`, `bg-dark-500`)
   - Typography (`text-sm`, `font-semi-bold`, `text-white`)
   - Transitions & Interactions (`transition-colors`, `hover:bg-dark-400`, `focus:border-white`)
4. **Dark Mode Classes**: Default styles MUST support dark theme tokens natively (`bg-dark-400 text-white`). Use explicit light/dark modifiers where dual theme compatibility is required.
