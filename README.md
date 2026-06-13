<p align="center">
  <img src="./public/logo.png" lt="Logo" width="65" />
<p>

# Modest Human Brands

<p align="center">
  <a href="https://shirsendu-bairagi.betteruptime.com">
    <img src="https://uptime.betterstack.com/status-badges/v3/monitor/10aqw.svg" alt="uptime status">
  </a>
</p>

![Landing](public/previews/landing.webp)

> Autonomous Next-Gen Media Operating System Integrating MWap, MConnect, MDoc, MCoordinate, MSync, MMedia, MDrive, MAssist

- 📦 SSR
- 🖼️ OG Tags
- 🚀 PWA
- ✋ Push Notification
- 🌙 Light/Dark Mode
- 🐋 Containerized
- 🪄 CI/CD (Github Action)
- 🎭 Authentication (OAuth 2.0)
- ⚡️ API Route Caching
- 📐 Analytics

---

### MHB Ecosystem Progress Tracker

**Legend:** ✅ Complete / Defined | 🚧 In Progress | ⏳ Pending / Planned

| Microservice       | Core Feature                      | Architecture | API Design | UX Design | Implementation (Code) | Testing | Production (MVP) |
| ------------------ | --------------------------------- | ------------ | ---------- | --------- | --------------------- | ------- | ---------------- |
| **1. MHB**         | Unified UI & Global Core          | 🚧           | 🚧         | 🚧        | 🚧                    | ⏳      | ⏳               |
| **2. MWap**        | Media-Centric Website Builder     | ✅           | ⏳         | ⏳        | ⏳                    | ⏳      | ⏳               |
| **3. MConnect**    | Comms Aggregator & CRM            | ✅           | ✅         | 🚧        | 🚧                    | 🚧      | 🚧               |
| **4. MDoc**        | Document & Signature Engine       | ✅           | ✅         | 🚧        | 🚧                    | 🚧      | 🚧               |
| **5. MCoordinate** | Internal Project Chat             | ✅           | ⏳         | ⏳        | ⏳                    | ⏳      | ⏳               |
| **6. MSync**       | Desktop Streaming                 | ✅           | 🚧         | 🚧        | 🚧                    | ⏳      | ⏳               |
| **7. MMedia**      | Event-Driven Processing Pipeline  | ✅           | 🚧         | 🚧        | 🚧                    | ⏳      | ⏳               |
| **8. MDrive**      | Asset Management & Client Gallery | ✅           | ✅         | 🚧        | 🚧                    | 🚧      | 🚧               |
| **9. MAssist**     | Global AI Harness                 | ✅           | 🚧         | ⏳        | ⏳                    | ⏳      | ⏳               |

#### MHB Ecosystem Percentage

Formula = [ (✅ x 1.0) + (🚧 x 0.5) + (⏳ x 0.0) ] / Total Tasks x 100

Total Tasks = 9 microservices x 6 phases = 54

Progress = [ (11 x 1.0) + (23 x 0.5) + (21 x 0.0) ] / 54 x 100 = 41.66

---

### Roadmap

| Order | Route                            | Module              | Complexity Profile                                                                                                                                   | Status         |
| ----- | -------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **1** | `GET /api/health`                | 0. System Core      | **Trivial**: Simple static JSON response checking infrastructure deployment node readiness.                                                          | ✅ **Done**    |
| **2** | `GET /api/organization`          | 0.1 Global Branding | **Low**: Basic DB query to retrieve the global workspace index and active tenant list.                                                               | ✅ **Done**    |
| **3** | `GET /api/organization/:orgId`   | 0.1 Global Branding | **Low**: Resolves specific organization metadata, custom domain mappings, and theme variables.                                                       | ✅ **Done**    |
| **4** | `POST /api/user`                 | 0.3 Unified Auth    | **Medium**: Requires transactional logic to provision a new identity, bind it to an organization, and establish baseline RBAC permissions.           | ⏳ **Pending** |
| **5** | `GET /api/user`                  | 0.3 Unified Auth    | **Low**: JWT/Session decoding to fetch the active user context, profile attributes, and localized permission scopes.                                 | ⏳ **Pending** |
| **6** | `PATCH /api/user/:id`            | 0.3 Unified Auth    | **Low**: Simple state mutation to update user profile flags (e.g., marking `isProfileComplete` as true).                                             | ⏳ **Pending** |
| **7** | `POST /api/contacts`             | 2.1 MConnect Core   | **Low-Med**: Requires checking for existing identifiers (phone, email) to prevent duplicates before upserting the CRM profile.                       | ⏳ **Pending** |
| **8** | `GET /api/contacts/:id/timeline` | 2.1 MConnect Core   | **Medium**: Requires an aggregated, time-sorted database query across multiple interaction tables (calls, SMS, emails).                              | ⏳ **Pending** |
| **9** | `POST /webhook/ingest/:channel`  | 2.2 MConnect Ingest | **Medium**: Requires strict payload normalization to translate varying third-party schemas (Meta, Plivo, SendGrid) into a unified MHB ledger format. | ⏳ **Pending** |

Progress = 3/9 = 60%

---

# Specs

## 0. Health Layer

### `GET /api/health`

**Description:** Verification ping to check system readiness and isolate active compute infrastructure nodes.

**Input:** _(None)_

**Output (JSON):**

```json
{
  "status": "OK",
  "node": "Gigabyte"
}
```

---

# Avatar

size = 2(font-size) + 8

## Change the Icons and Screenshots

dir public/pwa/screenshot

## Signing Config

put upload-keystore.jks, keystore.properties into src-tauri/gen/android

add those files into the .gitignore on the same folder

---

## License

Published under the [MIT](https://github.com/Modest-Human-Brands/modest-human-brands/blob/main/LICENSE) license.
<br><br>
<a href="https://github.com/Modest-Human-Brands/modest-human-brands/graphs/contributors">
<img src="https://contrib.rocks/image?repo=Modest-Human-Brands/modest-human-brands" />
</a>
