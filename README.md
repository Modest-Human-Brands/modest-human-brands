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

---

### MHB Ecosystem Percentage

Formula = [ (✅ x 1.0) + (🚧 x 0.5) + (⏳ x 0.0) ] / Total Tasks x 100

Total Tasks = 9 microservices x 6 phases = 54

Progress = [ (11 x 1.0) + (23 x 0.5) + (21 x 0.0) ] / 54 x 100 = 41.66

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
