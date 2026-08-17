### Assets Required for this Design

- **[Brand Logo]:** The "Modest Human Brands" typography and the circular brand icon. Path: `app/assets/icons/logo.svg`
- **[Hero Grid Pattern]:** Faint, repeating square grid background for the top hero section. Path: `public/images/bg-grid-dark.svg`
- **[Hero Image: Woman Motion Blur]:** A high-quality, large-scale grayscale photograph featuring a smiling woman holding a tablet (with the MHB icon on the screen), surrounded by people in motion blur. Path: `public/images/hero-image-1.png`
- **[Background Texture: Purple Radiant]:** Colorful, radiant gradient texture for the first feature section (MDOC). Path: `public/images/bg-texture-purple.jpg`
- **[Background Texture: Teal Radiant]:** Colorful, radiant gradient texture for the second feature section (MCOORDINATE). Path: `public/images/bg-texture-teal.jpg`
- **[Background Texture: Green Radiant]:** Colorful, radiant gradient texture for the third feature section (MSYNC). Path: `public/images/bg-texture-green.jpg`
- **[Background Texture: Orange Radiant]:** Colorful, radiant gradient texture for the fourth feature section (MDRIVE). Path: `public/images/bg-texture-orange.jpg`
- **[Background Texture: Blue/Purple Radiant]:** Wide glowing texture for the bottom CTA banner. Path: `public/images/bg-texture-blue-purple.jpg`
- **[UI Mockups]:** High-fidelity screenshots for the sub-hero and feature sections.
  - Feature 1 Sub-hero: `public/images/mockup-progress.png`
  - MDOC (Purple): `public/images/mockup-document.png`
  - MCOORDINATE (Teal): `public/images/mockup-stream-1.png`
  - MSYNC (Green): `public/images/mockup-stream-2.png`
  - MDRIVE (Orange): `public/images/mockup-media.png`
- **[System Icons]:** UI icons for grids, features, and pricing tier lists.
  - Top row (Sub-hero center): Dashboard, network, calendar, document, refresh, etc.
  - Pricing - Individual: User, Chat-bubble, Sparkle, Briefcase.
  - Pricing - Enterprise: Users, Chat-approve, Sparkle-plus, Link, Shield.
- **[Social Icons]:** 40 × 40 px icons for the top right header.
  - Instagram: `app/assets/icons/instagram.svg`
  - LinkedIn: `app/assets/icons/linkedin.svg`
  - YouTube: `app/assets/icons/youtube.svg`

---

### Key Content & Layout Corrections (Refined from Mockups)

1. **Header:** Features Instagram, LinkedIn, and YouTube (not X).
2. **Hero:** Includes a faint, dark grid background behind the text. The CTA button is outlined in an accent color (purple/blue) rather than filled.
3. **Feature Tags:** Replaced generic "FEATURE 1" tags with specific module names: `MHB • MDOC`, `MHB • MCOORDINATE`, `MHB • MSYNC`, and `MHB • MDRIVE`.
4. **Pricing Toggle:** The toggle switches between **Personal** and **Business** (not Monthly/Annual).
5. **Pricing Tiers:** The plans are **INDIVIDUAL** and **ENTERPRISE** (previously noted as Studio). Enterprise includes a blue "RECOMMENDED" badge and a blue filled CTA button.
6. **Footer:** A simplified left-aligned vertical stack (Terms, Privacy, Cancellation, License) with "© 2026 Modest Human Brands LLP" at the bottom border.

---

### ASCII Detailed Layout & Token Mapping

The layout heavily utilizes the `dark-400` (#191919) background with `white` (#FFFFFF) text. The typography relies entirely on the **Exo 2** font family.

```text
====================================================================================================
|  [Brand Logo] Modest Human Brands             [Social Icon: Instagram] [LinkedIn] [YouTube]      |
====================================================================================================
|  [ Hero Grid Pattern Background ]                                                                |
|  [Spacing: pt-24 md:pt-32]                                                                       |
|                                                                                                  |
|                                        [MHB Dual-Face Icon]                                      |
|                                                                                                  |
|                             The Project Management {Software}                                    |
|            Manage your projects, media assets, and client approvals with one tool.               |
|                                                                                                  |
|                                     [   Get Started   ] (Outlined pill)                          |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                                                                                            |  |
|  |                           [Hero Image: Woman Motion Blur]                                  |  |
|  |                                                                                            |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|  +-----------------------------+  +-----------------------------+  +--------------------------+  |
|  | Creative Project Management |  | End-to-End Agency OS        |  | Collaborative Creative...|  |
|  | Track shoots, tasks, and... |  | Unify contract sign-offs... |  | Connect your team and... |  |
|  | [UI Mockup: Progress Bar]   |  | [Row of 8 System Icons]     |  | [Avatars & Action Icons] |  |
|  +-----------------------------+  +-----------------------------+  +--------------------------+  |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                           [Hero Image: Woman Motion Blur (Continued)]                      |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|  [Spacing: py-24]                                                                                |
|  +--------------------------------------------+-----------------------------------------------+  |
|  | MHB • MDOC                                 |                                               |  |
|  | Frictionless client agreements             |    [Background Texture: Purple Radiant]       |  |
|  | Generate SOWs, collect e-signatures, and...|    [UI Mockup: Document Contract]             |  |
|  |  * Instant e-signatures for clients...     |                                               |  |
|  |  * 10x faster SOW creation with pre...     |                                               |  |
|  |  * Automated team onboarding &...          |                                               |  |
|  |  * Integrated invoicing linked...          |                                               |  |
|  +--------------------------------------------+-----------------------------------------------+  |
|                                                                                                  |
|  +--------------------------------------------+-----------------------------------------------+  |
|  | MHB • MCOORDINATE                          |                                               |  |
|  | Real-time team & shoot coordination        |    [Background Texture: Teal Radiant]         |  |
|  | Eliminate WhatsApp chaos and scattered...  |    [UI Mockup: Video Call]                    |  |
|  |  * Project-channeled chat and video...     |                                               |  |
|  |  * Live location tracking for on-set...    |                                               |  |
|  |  * Direct media streaming straight...      |                                               |  |
|  |  * Automated real-time file sync...        |                                               |  |
|  +--------------------------------------------+-----------------------------------------------+  |
|                                                                                                  |
|  +--------------------------------------------+-----------------------------------------------+  |
|  | MHB • MSYNC                                |                                               |  |
|  | Live stream & media sync                   |    [Background Texture: Green Radiant]        |  |
|  | Eliminate manual file transfers and...     |    [UI Mockup: Media Sync]                    |  |
|  |  * Instant background syncing...           |                                               |  |
|  |  * Continuous asset handoff from...        |                                               |  |
|  |  * Automated media streaming and...        |                                               |  |
|  |  * Real-time state updates across...       |                                               |  |
|  +--------------------------------------------+-----------------------------------------------+  |
|                                                                                                  |
|  +--------------------------------------------+-----------------------------------------------+  |
|  | MHB • MDRIVE                               |                                               |  |
|  | Unified media storage & distribution       |    [Background Texture: Orange Radiant]       |  |
|  | Organize raw production files, control...  |    [UI Mockup: Media Storage]                 |  |
|  |  * Unified cloud storage for high-res...   |                                               |  |
|  |  * Access-controlled distribution...       |                                               |  |
|  |  * Smart media organization built...       |                                               |  |
|  |  * Native file sync with MSync and...      |                                               |  |
|  +--------------------------------------------+-----------------------------------------------+  |
|                                                                                                  |
|  [Spacing: py-24]                                                                                |
|                               ( Personal )=====( Business )                                      |
|                                                                                                  |
|              +----------------------------------+   +----------------------------------+         |
|              | INDIVIDUAL                       |   | ENTERPRISE         [RECOMMENDED] |         |
|              | For Solo Creators                |   | For Studios                      |         |
|              | For independent creators...      |   | For agencies production houses...|         |
|              |                                  |   |                                  |         |
|              | ₹499 / month                     |   | ₹3,999 / month                   |         |
|              |                                  |   |                                  |         |
|              | [         Get Started          ] |   | [ * Upgrade to Enterprise      ] |         |
|              |                                  |   |                                  |         |
|              |  [Icon: User] 1 Core Workspace...|   |  [Icon: Users] Multi-Seat Core...|         |
|              |  [Icon: Chat] Simple Project...  |   |  [Icon: Chat+] Detailed Project..|         |
|              |  [Icon: Spark] Fixed Standard... |   |  [Icon: Spark+] Fixed Standard...|         |
|              |  [Icon: Case] Self-Serve...      |   |  [Icon: Link] Automated Integr...|         |
|              |                                  |   |  [Icon: Shield] Dedicated White..|         |
|              +----------------------------------+   +----------------------------------+         |
|                                                                                                  |
|  [Spacing: py-24]                                                                                |
|  +--------------------------------------------------------------------------------------------+  |
|  |                           [Background Texture: Blue/Purple Radiant]                        |  |
|  |                                                                                            |  |
|  |                 Take your team's productivity to the next                                  |  |
|  |                       level with Modest Human Brands                                       |  |
|  |                                                                                            |  |
|  |                              [    Get Started    ]                                         |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|  [Footer Spacing: px-6 py-12]                                                                    |
|  Terms                                                                                           |
|  Privacy                                                                                         |
|  Cancellation                                                                                    |
|  License                                                                                         |
|                                                                                                  |
|--------------------------------------------------------------------------------------------------|
|  © 2026 Modest Human Brands LLP                                                                  |
====================================================================================================

```

---

### Design Token Application Guide

- **Global Background:** Apply `bg-dark-400` (#191919) for the main page background. Use `bg-[url('/images/bg-grid-dark.svg')]` with low opacity for the hero section grid.
- **Hero Typography:** The headline "The Project Management Software" uses `text-5xl` with a Semi-bold weight. The word "Software" should be highlighted using the `accent-500` (#5945EA) token.
- **Section Spacing:** Use `pt-24 md:pt-32` and `pb-32` for the Hero section to ensure proper clearance. Feature sections and the pricing/CTA sections utilize `py-24` (192 px vertical padding).
- **Feature Module Labels:** Text like "MHB • MDOC" uses tracking-wide uppercase typography (e.g., `text-xs font-semi-bold tracking-widest text-light-400`).
- **Pricing Toggle:** The Personal/Business toggle utilizes a dark pill background (`dark-600`) with a lighter active state (`dark-500`).
- **Pricing Cards:**
- **INDIVIDUAL Plan:** Uses `dark-500` (#2B2B2B) for its dark card surface. CTA button is white with black text.
- **ENTERPRISE Plan:** Uses a vertical gradient background (`bg-gradient-to-b from-[#1F2937] to-dark-500`) with a subtle blue outer glow. The "RECOMMENDED" badge and CTA button use the `info-500` (#47A8EB) blue token.
- Corner radius for these cards should be `rounded-2xl` (16-24 px).

- **Bottom CTA:** The large banner is a CTA card pattern requiring `p-12 md:p-20` padding. The background image must be set to `size-full object-cover`.
- **Footer:** The footer requires a border top (`border-t border-white/10`). Navigation links are stacked vertically on the left. The copyright text uses the `text-xs` caption size with a Light font weight placed beneath a final horizontal divider.
