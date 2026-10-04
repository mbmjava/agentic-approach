---
title: Package layout (hexagonal)
type: architecture
status: active
owner: mbmjava
last_updated: 2026-10-04
tags: [architecture, java]
---

# Package layout (hexagonal)

The sample uses a per-feature hexagonal layout. One feature is one package under
`io.agenticapproach.app`:

```
greeting/
  domain/        # values and rules — no Spring, no IO
  application/   # inbound ports (interfaces) + services; depends only on domain
  adapter/web/   # driving adapters (HTTP); depends on application ports
```

Rules:

- **Depend inward:** `adapter -> application -> domain`. The domain never imports framework or
  infrastructure types.
- **Ports at the boundary.** Define an inbound port (an interface) for what the outside may ask; the
  adapter depends on the port, not the implementation. Add an outbound port under `application/` for
  anything the app calls out to (database, HTTP client), implemented under `adapter/`.
- **Constructor injection**, `private final` fields; no field injection.
- **Hermetic tests.** Test the domain and services with plain Java; reserve `@WebMvcTest` /
  `@SpringBootTest` for wiring checks.
- **One feature per package.** Keep a feature's domain, application, and adapters together, and let
  features depend on each other only through their application ports.

Spring Modulith can be layered on later to enforce these boundaries at build time; the starter does
not include it.
