# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository status

This repository now contains an initial real application scaffold for “兔兔智能视觉创意设计工作台”: a native SwiftUI iOS app under `ios/TuTuVisionApp` and a Node.js/Fastify backend API skeleton under `backend`. The original README and PNG visual assets remain the product/design source material.

The current implementation is an early commercial-product scaffold, not a finished production system. The iOS app has clickable major flows and calls backend APIs. The backend has in-memory route implementations for app data, generation jobs, assets, admin metrics, templates, and settings, plus JWT-based admin login/RBAC guards and a Prisma schema that defines the intended PostgreSQL data model. Real persistence, storage, payment, and production admin hardening still need to be completed.

## Current commands

From `backend`:

```bash
npm install
cp .env.example .env
npm run dev
npm run build
npm run test
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

The iOS app is opened from `ios/TuTuVisionApp/TuTuVisionApp.xcodeproj` in Xcode. Select the `TuTuVisionApp` scheme and an iOS simulator, then run it. The app expects the backend at `http://127.0.0.1:3000` by default via `API_BASE_URL` in `Info.plist`.

The browser admin console is served by the backend at `http://127.0.0.1:3000/admin`. Development credentials are `admin@tutu.local` / `TutuAdmin123!` for full admin access and `operator@tutu.local` / `TutuOperator123!` for content-operator access.

For real image generation, set `OPENAI_API_KEY` and optionally `OPENAI_IMAGE_MODEL` in `backend/.env`. The backend currently calls `POST https://api.openai.com/v1/images/generations` from `src/providers/imageProvider.ts` when generation jobs are submitted.

## Product architecture from existing materials

The README defines the target product as a commercial AI visual creative productivity platform powered by a GPT image-2.0 style image generation engine. The primary product shape is a cross-platform mobile app for iOS and Android, with a WeChat mini-program as a lightweight entry point and a Web workstation planned for a later phase.

The intended user-facing mobile app contains these major areas: onboarding and brand introduction, home scene entry points, a creation page for prompt input and generation parameters, a generation result page, a template marketplace, a project workspace and personal asset library, an inspiration community, and a profile/subscription area. Existing PNGs in the repository correspond to these flows and should be treated as the visual source of truth unless replaced by newer designs.

The core business flow should be implemented around scene-based AI visual creation rather than static UI mockups. Users should be able to choose a scene/template, enter or enhance a prompt, optionally provide reference images, submit a generation task, review generated results, save results into projects/assets, and manage their usage quota or subscription state.

The README describes the core domain modules as intelligent creation, scene templates, project workflow, value-added features, and commercialization. Intelligent creation includes text-to-image, image-to-image, multi-image fusion, inpainting, outpainting, and accurate text embedding. The MVP phase only commits to text-to-image, image-to-image, 10 core templates, personal asset library, and basic membership.

The planned technical architecture in the README is Flutter for the cross-platform mobile app, Taro for the mini-program, Node.js or Go microservices for the backend, object storage plus CDN for generated image assets, PostgreSQL for relational data, Redis for queues/cache/rate limits, and a vector database for later prompt/template retrieval or similarity features.

## Backend and admin requirements

The product requires a real backend, not just front-end screens. A commercial initial version should include authentication, user accounts, role-based admin permissions, content management for templates/projects/assets/community posts, a data dashboard, and system configuration.

Generation should be modeled as asynchronous jobs rather than direct blocking UI calls. The backend should accept a generation request, persist a job record, enqueue or dispatch work to the AI provider layer, store output images in object storage, update job state, and let the app poll or subscribe for completion. The provider layer should be abstracted so development can use a mock generator while production integrates the real image API.

Admin management should be separated from the consumer mobile app. It should support admin login, role/permission checks, user and quota management, template/content CRUD, moderation/status workflows, operational metrics, and system settings such as model provider configuration, feature flags, pricing/plan settings, and audit-relevant controls.

## Data model direction

When implementing, expect at least these core entities: users, roles, permissions, subscriptions/plans, usage quotas, templates, template categories, generation jobs, generated assets, projects, project assets, prompt records, community posts, favorites/likes, orders or payment records, system settings, and audit logs.

PostgreSQL should be the source of truth for transactional state. Generated images and uploads should live in object storage, with database records storing metadata and URLs/keys. Redis is appropriate for rate limiting, generation queues, cache, and short-lived session or verification state if needed.

## Existing design assets

Current visual assets in the repository include onboarding, home, creation, generation result, template plaza, project workspace/material library, inspiration community, profile/subscription, design specification, and full app flowchart PNG files. Use these to infer layout, navigation, brand tone, and initial screens.

Brand guidance from the README: warm orange `#FF6B35`, intelligent purple `#6C5CE7`, creative yellow `#FFD93D`, white `#FFFFFF`, dark gray `#2D3436`, and light gray background `#F8F9FA`. The style direction is rounded, light, young, friendly, professional, and a blend of neumorphism and glassmorphism. The mascot is an orange rabbit wearing a designer beret and holding a brush.

## Implementation notes

Keep mobile app, backend API, admin console, and infrastructure/database concerns clearly separated so the project does not regress into a static prototype. For the next implementation passes, prioritize replacing in-memory backend state with Prisma/PostgreSQL services, adding real auth and admin RBAC enforcement, adding object storage for generated images, implementing a dedicated admin web console, and adding automated API and iOS tests.