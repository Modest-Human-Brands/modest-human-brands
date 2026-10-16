<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Modest-Human-Brands/modest-human-brands/main/public/logo.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Modest-Human-Brands/modest-human-brands/main/public/logo.svg">
    <img alt="Modest Human Brands Logo" src="https://raw.githubusercontent.com/Modest-Human-Brands/modest-human-brands/main/public/logo.svg" width="96" height="96" />
  </picture>
</p>

<h1 align="center">Modest Human Brands</h1>

<p align="center">
  <strong>The collaborative workflow management platform built for creatives.</strong>
</p>

<p align="center">
  <a href="https://github.com/Modest-Human-Brands/modest-human-brands/actions/workflows/integrate.yml"><img src="https://github.com/Modest-Human-Brands/modest-human-brands/actions/workflows/integrate.yml/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/Modest-Human-Brands/modest-human-brands/releases"><img src="https://img.shields.io/github/v/release/Modest-Human-Brands/modest-human-brands?color=blue&label=version" alt="Latest Release"></a>
  <a href="https://shirsendu-bairagi.betteruptime.com"><img src="https://uptime.betterstack.com/status-badges/v3/monitor/10aqw.svg" alt="Uptime Status"></a>
  <a href="https://github.com/Modest-Human-Brands/modest-human-brands/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Modest-Human-Brands/modest-human-brands?color=green" alt="License: MIT"></a>
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-4.5.2-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4"></a>
  <a href="https://tauri.app"><img src="https://img.shields.io/badge/Tauri-2.12-24C8D8?logo=tauri&logoColor=white" alt="Tauri 2"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-1.4.2-FBF0DF?logo=bun&logoColor=black" alt="Bun"></a>
</p>

---

Modest Human Brands (MHB) is a unified creative operations platform orchestrating multi-tenant project management, secure document signing, client asset review galleries, omnichannel communication, and realtime streaming. Built as a full-stack Nuxt 4 application running on the Nitro server engine, it compiles natively into cross-platform desktop and mobile clients via Tauri 2 and provides native Model Context Protocol (MCP) server tooling.

### Features

- ⚡ **Full-Stack Nuxt 4 & Nitro Architecture:** High-performance SSR, edge caching, static generation, and scheduled background resource synchronization powered by Bun.
- 🖥️ **Cross-Platform Native Runtime:** First-class desktop (macOS Apple Silicon & Intel, Linux, Windows) and mobile (Android APK/AAB) compilation via Tauri 2 and Rust.
- 🎥 **Realtime Media & Live Streaming:** LiveKit WebRTC video huddle rooms, SRT hardware streaming ingest, and multi-resolution HLS media playback.
- 💬 **Federated Messaging & Omnichannel CRM:** Matrix Synapse E2EE chat bridge, unified customer contact timelines, and dynamic multi-channel email/SMS templating.
- ✍️ **Cryptographic Document Engine:** Interactive WYSIWYG document builder powered by Tiptap, sequential multi-party signer routing, and mathematical signature verification.
- 🤖 **Model Context Protocol (MCP) Support:** Built-in `@nuxtjs/mcp-toolkit` integration exposing system health and runtime introspection to AI agents.
- 🔒 **Enterprise-Grade Security & Push Notifications:** Session-backed OAuth 2.0 authentication (Google & Passwordless Email OTP), Web Push notifications via VAPID, and Gitleaks scanning.

---

## Visual Previews

<p align="center">
  <img src="https://raw.githubusercontent.com/Modest-Human-Brands/modest-human-brands/main/public/previews/landing.webp" alt="Modest Human Brands Landing Page" width="85%" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Modest-Human-Brands/modest-human-brands/main/public/previews/dashboard.webp" alt="Modest Human Brands Dashboard" width="85%" />
</p>

---

## Architecture & Ecosystem

MHB functions as the unified UI and global core orchestrating nine distinct microservice domains:

```
                    ┌───────────────────────────────────────────────┐
                    │               0. MHB Global Core              │
                    │      (Nuxt 4 / Nitro / Tauri 2 / MCP)         │
                    └───────┬───────────────────────────────┬───────┘
                            │                               │
        ┌───────────────────┼───────────────────┐           │
        ▼                   ▼                   ▼           ▼
  1. MWap             2. MConnect         3. MDoc     4. MCoordinate
  Website Builder     Omnichannel CRM     E-Signature Matrix Chat &
  & Edge Engine       & Template Dispatch Engine      LiveKit Huddles
        │                   │                   │           │
        ├───────────────────┼───────────────────┤           │
        ▼                   ▼                   ▼           ▼
  5. MSync            6. MMedia           7. MDrive   8. MAssist
  SRT Ingress &       Transcoding & ABR   Asset Drive AI Harness &
  Mesh P2P Sync       Live Packaging      & Reviews   MCP Server
```

| Domain             | Service Name       | Responsibility                                                      | Gateway Implementation    |
| :----------------- | :----------------- | :------------------------------------------------------------------ | :------------------------ |
| **0. MHB**         | Unified Core       | Authentication, Multi-tenant routing, Dashboard UI, MCP tool        | `server/api/*`, `app/*`   |
| **1. MWap**        | Website Builder    | Media-centric site builder, SSR edge engine, tenant routing         | Integration Planned       |
| **2. MConnect**    | Omnichannel CRM    | Ingest controller, interaction timelines, templated email/SMS       | `server/api/connect/*`    |
| **3. MDoc**        | Document Engine    | Template rendering, sequential signer queue, signature verification | `server/api/doc/*`        |
| **4. MCoordinate** | Team Collaboration | Matrix Synapse E2EE sync, session provisioning, LiveKit audio/video | `server/api/coordinate/*` |
| **5. MSync**       | Media Ingress      | SRT hardware stream ingestion, camera telemetry (CCTL), P2P mesh    | `server/api/stream/*`     |
| **6. MMedia**      | Media Pipeline     | Event-driven processing, adaptive bitrate (ABR) transcoding         | `server/tasks/sync/*`     |
| **7. MDrive**      | Asset Management   | Batch uploads, version stacking, pin-point canvas commenting        | `server/api/drive/*`      |
| **8. MAssist**     | AI Harness         | MCP server protocol, automated context gathering, agent tooling     | `server/mcp/*`            |

---

## Command-Line & Task Reference

Project tasks are driven by Bun and Tauri CLI.

### Package Scripts (`package.json`)

| Script               | Command                                                                                                        | Description                                                   |
| :------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| `dev`                | `nuxt dev --host`                                                                                              | Start Nuxt local development server with LAN host binding     |
| `build`              | `nuxt build`                                                                                                   | Compile the full-stack Nuxt/Nitro application for production  |
| `generate`           | `nuxt generate`                                                                                                | Pre-render static pages to `dist/`                            |
| `preview`            | `nuxt preview`                                                                                                 | Locally preview the production build output                   |
| `start`              | `node --env-file=.env.prod .output/server/index.mjs`                                                           | Launch compiled Nitro server using Node.js and `.env.prod`    |
| `clean`              | `nuxt cleanup && (cd src-tauri && cargo clean)`                                                                | Remove `.nuxt/`, `.output/`, and Cargo build artifacts        |
| `lint`               | `eslint . --fix`                                                                                               | Lint codebase with `@nuxt/eslint` and auto-apply fixes        |
| `format`             | `prettier . --write`                                                                                           | Format code, templates, and styles using Prettier             |
| `detect`             | `gitleaks git --verbose`                                                                                       | Scan git history for committed credentials and secret leaks   |
| `test:load`          | `k6 run test/load.test.ts`                                                                                     | Execute k6 load test suite (99th percentile `< 3000ms`)       |
| `docker:build`       | `docker build --build-arg VERSION=dev --build-arg BUILD_TIME=now -t modest-human-brands:dev .`                 | Build multi-stage Bun production container image              |
| `docker:start`       | `docker run --detach --name modest-human-brands-dev --env-file .env.prod -p 4000:3000 modest-human-brands:dev` | Run containerized application on host port `4000`             |
| `tauri`              | `tauri`                                                                                                        | Invoke Tauri 2 CLI                                            |
| `tauri:dev`          | `tauri dev`                                                                                                    | Launch Tauri desktop application in development mode          |
| `tauri:build`        | `tauri build`                                                                                                  | Compile release desktop bundle for current operating system   |
| `tauri:dev:mobile`   | `tauri android dev`                                                                                            | Launch Tauri Android application on connected device/emulator |
| `tauri:build:mobile` | `tauri android build`                                                                                          | Compile release Android APK and AAB bundles                   |
| `prepare`            | `husky \|\| true`                                                                                              | Configure Husky Git hooks                                     |
| `postinstall`        | `nuxt prepare`                                                                                                 | Generate Nuxt types and virtual imports                       |

### Container Build Arguments (`Dockerfile`)

| Argument     | Type     | Default   | Description                                              |
| :----------- | :------- | :-------- | :------------------------------------------------------- |
| `VERSION`    | `string` | _(empty)_ | App release tag injected into `NUXT_META_VERSION`        |
| `BUILD_TIME` | `string` | _(empty)_ | ISO timestamp injected into `NUXT_META_BUILD_TIME`       |
| `SITE_URL`   | `string` | _(empty)_ | Canonical site URL injected into `NUXT_PUBLIC_SITE_URL`  |
| `CDN_URL`    | `string` | _(empty)_ | Public asset CDN URL injected into `NUXT_PUBLIC_CDN_URL` |

---

## Server API Reference

The full-stack Nitro gateway implements typed handlers with input validation, session isolation, and downstream microservice proxying.

### 1. System & Diagnostics

#### `GET /api/health`

Returns the runtime health, application version, build timestamp, and infrastructure hostname.

- **Authentication:** Public
- **Response (`200 OK`):**
  ```json
  {
    "status": "OK",
    "version": "0.10.19",
    "buildTime": "2026-10-16T00:00:00.000Z",
    "node": "Gigabyte-Server-01"
  }
  ```

#### MCP Tool: `health`

Exposed to AI clients via `@nuxtjs/mcp-toolkit`:

- **Name:** `health`
- **Description:** `Get health, version, buildtime, and node`
- **Handler Output:** `{ status: "OK", version, buildTime, node }`

---

### 2. Waitlist & Ingestion

#### `POST /api/waitlist`

Validates user submission via Zod, verifies uniqueness against Notion, and stores new waitlist leads.

- **Authentication:** Public
- **Validation Schema (`waitlistSchema`):**
  | Field         | Type     | Rules                 |
  | :------------ | :------- | :-------------------- |
  | `name`        | `string` | Minimum 2 characters  |
  | `phone`       | `string` | Minimum 5 characters  |
  | `email`       | `string` | Valid email address   |
  | `company`     | `string` | Minimum 2 characters  |
  | `description` | `string` | Minimum 10 characters |
- **Errors:**
  - `400 Bad Request`: Form validation failure
  - `409 Conflict`: Email or phone already registered on waitlist
- **Response (`200 OK`):** `{ "status": "OK" }`

---

### 3. Authentication & Sessions

| Method  | Endpoint       | Description                                                      | Input / Parameters                |
| :------ | :------------- | :--------------------------------------------------------------- | :-------------------------------- |
| `GET`   | `/auth/google` | Initiates Google OAuth 2.0 flow; auto-provisions user in Notion  | None                              |
| `POST`  | `/auth/email`  | Requests 8-char OTP or validates OTP to establish 30-day session | `{ email: string, otp?: string }` |
| `PATCH` | `/auth/device` | Updates active `deviceId` in the current authenticated session   | `{ deviceId: string }`            |

---

### 4. Organization, Users & Contacts

| Method | Endpoint                   | Auth Required | Description                                                           |
| :----- | :------------------------- | :-----------: | :-------------------------------------------------------------------- |
| `GET`  | `/api/organization`        |      Yes      | Retrieves organization records, branding, and billing profiles        |
| `GET`  | `/api/organization/:orgId` |      Yes      | Retrieves details for an individual organization                      |
| `GET`  | `/api/user`                |      Yes      | Fetches members belonging to the active organization                  |
| `POST` | `/api/user`                |      Yes      | Completes user profile (`completeUserFormSchema`) & replaces session  |
| `GET`  | `/api/contact`             |      Yes      | Returns contacts associated with the caller's active organization     |
| `GET`  | `/api/client`              |      Yes      | Lists CRM clients with contact metadata, tags, and last active status |

---

### 5. Document & Signature Engine (`MDoc`)

| Method | Endpoint                                    | Auth Required | Description                                                            |
| :----- | :------------------------------------------ | :-----------: | :--------------------------------------------------------------------- |
| `GET`  | `/api/doc`                                  |      Yes      | Fetches document registry from cache storage                           |
| `GET`  | `/api/doc/template`                         |      Yes      | Lists available document contract templates                            |
| `POST` | `/api/doc/template`                         |      Yes      | Provisions a new document from a template definition                   |
| `POST` | `/api/doc/template/preview`                 |      Yes      | Renders base64 PDF preview for given template and variables            |
| `GET`  | `/api/doc/:projectId`                       |      Yes      | Lists documents scoped to a specific project                           |
| `GET`  | `/api/doc/:projectId/:docId`                |      No       | Fetches document metadata, file extensions, and signature verification |
| `POST` | `/api/doc/:projectId/:docId/void`           |      Yes      | Voids document envelope (requires `reason` with ≥ 5 chars)             |
| `POST` | `/api/doc/:projectId/:docId/session`        |      Yes      | Generates signer session token and dispatches magic link email         |
| `POST` | `/api/doc/:projectId/:docId/session/verify` |      No       | Verifies validity and signer role of a session token                   |
| `POST` | `/api/doc/:projectId/:docId/sign/prepare`   |      No       | Stages signer telemetry and emits `DOCUMENT_SIGNED` push event         |
| `POST` | `/api/doc/:projectId/:docId/sign/client`    |      No       | Submits cryptographic client signature and advances signer queue       |
| `POST` | `/api/doc/:projectId/:docId/sign/server`    |      Yes      | Applies cryptographic server signature and seals document              |

---

### 6. Media Drive & Asset Review (`MDrive`)

| Method | Endpoint                                       | Auth Required | Description                                            |
| :----- | :--------------------------------------------- | :-----------: | :----------------------------------------------------- |
| `GET`  | `/api/drive`                                   |      Yes      | Lists all project drives with photo/video media counts |
| `GET`  | `/api/drive/:projectId`                        |      Yes      | Retrieves project drive assets and collection folders  |
| `GET`  | `/api/drive/:projectId/media`                  |      Yes      | Lists asset items and metadata for project             |
| `POST` | `/api/drive/:projectId/media/comments`         |      Yes      | Adds review comment with canvas coordinates $(X, Y)$   |
| `POST` | `/api/drive/:projectId/media/comments/query`   |      Yes      | Queries comment threads and pins for specified media   |
| `POST` | `/api/drive/:projectId/media/uploads`          |      Yes      | Initializes batch multi-file upload session            |
| `GET`  | `/api/drive/:projectId/media/uploads/:batchId` |      Yes      | Polls upload batch status and processing state         |

---

### 7. Realtime Streaming & Collaboration

| Method   | Endpoint                             | Auth Required | Description                                                      |
| :------- | :----------------------------------- | :-----------: | :--------------------------------------------------------------- |
| `GET`    | `/api/coordinate/auth`               |      Yes      | Obtains Matrix Synapse access token and E2EE recovery key        |
| `GET`    | `/api/stream`                        |      Yes      | Retrieves active project streams from storage                    |
| `GET`    | `/api/stream/:projectId`             |      No       | Resolves project stream metadata and status                      |
| `POST`   | `/api/stream/:projectId`             |      No       | Provisions LiveKit room token, SRT ingress URL, and HLS manifest |
| `POST`   | `/api/notification/push/subscribe`   |      Yes      | Registers Web Push subscription (`p256dh`, `auth`)               |
| `DELETE` | `/api/notification/push/unsubscribe` |      Yes      | Removes Web Push subscription for current user device            |

---

## Shared Utilities & Types

The `shared/` directory exports shared logic and schemas used across server and client:

```ts
import { formatBytes, changeCase, calculateAspectRatio, extractCdnId, unflattenPayload } from '~~/shared/utils'

// Human-readable byte formatting
formatBytes(1048576) // "1 MB"

// Case conversion
changeCase('hello world', 'sentence') // "Hello world"

// Aspect ratio parsing
calculateAspectRatio('16:9') // 1.7777777777777777

// CDN ID parsing
extractCdnId('https://cdn.modesthumanbrands.com/media/image/asset-123') // "asset-123"

// Flattened object expansion
unflattenPayload({ 'user.name': 'Alice', 'user.profile.age': 30 })
// { user: { name: 'Alice', profile: { age: 30 } } }
```

---

## Environment Configuration

Configuration is loaded from environment variables and `.env` files:

| Variable                          | Required |    Default    | Description                                              |
| :-------------------------------- | :------: | :-----------: | :------------------------------------------------------- |
| `NODE_ENV`                        |    No    | `development` | Node execution environment (`development`, `production`) |
| `PORT`                            |    No    |    `3000`     | HTTP server listening port                               |
| `NUXT_PUBLIC_SITE_URL`            |   Yes    |       —       | Canonical web address of the application                 |
| `NUXT_SESSION_PASSWORD`           |   Yes    |       —       | 32+ character secret used to encrypt session cookies     |
| `NOTION_API_KEY`                  |   Yes    |       —       | Notion Integration token for CMS and database queries    |
| `NUXT_PRIVATE_NOTION_DB_ID`       |   Yes    |       —       | JSON object mapping entity names to Notion database IDs  |
| `NUXT_PUBLIC_CONNECT_URL`         |   Yes    |       —       | Base HTTP URL for downstream MConnect microservice       |
| `NUXT_PUBLIC_DOC_URL`             |   Yes    |       —       | Base HTTP URL for downstream MDoc microservice           |
| `NUXT_PUBLIC_DRIVE_URL`           |   Yes    |       —       | Base HTTP URL for downstream MDrive microservice         |
| `NUXT_PUBLIC_MATRIX_URL`          |   Yes    |       —       | Synapse Matrix homeserver endpoint                       |
| `NUXT_PUBLIC_LIVEKIT_URL`         |   Yes    |       —       | LiveKit WebRTC server WebSocket URL                      |
| `NUXT_PRIVATE_LIVEKIT_API_KEY`    |   Yes    |       —       | LiveKit API Key for room creation and JWT minting        |
| `NUXT_PRIVATE_LIVEKIT_API_SECRET` |   Yes    |       —       | LiveKit API Secret                                       |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID`     |   Yes    |       —       | Google OAuth 2.0 client ID                               |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` |   Yes    |       —       | Google OAuth 2.0 client secret                           |
| `NUXT_PUBLIC_VAPID_KEY`           |   Yes    |       —       | Web Push VAPID public key                                |
| `NUXT_PRIVATE_VAPID_KEY`          |   Yes    |       —       | Web Push VAPID private key                               |
| `NUXT_PRIVATE_VAPID_SUBJECT`      |   Yes    |       —       | Mailto or URL identity for VAPID push service            |
| `PLATFORM_ENV`                    |    No    |       —       | Set to `native` during Tauri desktop/mobile builds       |
| `TAURI_DEV_HOST`                  |    No    |  `localhost`  | Host IP for Tauri mobile development server binding      |

---

<details>
<summary><strong>Local Development & Build Instructions</strong></summary>

### Prerequisites

- **Runtime:** [Bun](https://bun.sh) `^1.2.9` (Recommended `1.4.2`) or [Node.js](https://nodejs.org) (`^22.11.0 || ^24.14.0`)
- **Desktop/Mobile:** [Rust](https://www.rust-lang.org) (stable) and platform C/C++ toolchains
- **Mobile (Android):** Android Studio, SDK, NDK `29.0.13846066`, JDK 17

### 1. Clone & Install

```bash
git clone https://github.com/Modest-Human-Brands/modest-human-brands.git
cd modest-human-brands
bun install --frozen-lockfile
```

### 2. Configure Environment

```bash
cp .env.example .env
# Populate Notion, OAuth, and microservice keys in .env
```

### 3. Run Development Servers

```bash
# Web application
bun run dev

# Tauri desktop application
bun run tauri:dev

# Tauri Android mobile application
bun run tauri:dev:mobile
```

### 4. Quality & Testing

```bash
# Code formatting & linting
bun run lint
bun run format

# Secret leak detection
bun run detect

# K6 load testing
bun run test:load
```

### 5. Production Compilation

```bash
# Build web server
bun run build

# Build native desktop bundle
bun run tauri:build

# Build native Android APK & AAB
bun run tauri:build:mobile

# Build Docker container
bun run docker:build
```

</details>

---

## License

Published under the [MIT](https://github.com/Modest-Human-Brands/modest-human-brands/blob/main/LICENSE) license.

<br>

<a href="https://github.com/Modest-Human-Brands/modest-human-brands/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Modest-Human-Brands/modest-human-brands" alt="Contributors" />
</a>
