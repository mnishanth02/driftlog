# DriftLog PWA Implementation

Transform DriftLog from a mobile-first app into a fully functional Progressive Web App.

## Quick Links

| Phase | Document | Duration |
|-------|----------|----------|
| 1 | [Foundation Setup](./01-FOUNDATION.md) | 2-3h |
| 2 | [PWA Assets](./02-ASSETS.md) | 1-2h |
| 3 | [Component Replacements](./03-COMPONENTS.md) | 8-10h |
| 4 | [Service Worker](./04-SERVICE_WORKER.md) | 2h |
| 5 | [Deployment](./05-DEPLOYMENT.md) | 1h |
| 6 | [Responsive Design](./06-RESPONSIVE.md) | 3-4h |
| 7 | [Testing](./07-TESTING.md) | 2-3h |
| Ref | [Web Compatibility Gaps](./REFERENCE-WEB-GAPS.md) | - |

**Total Estimated Time:** 20-26 hours

---

## Technical Decisions

| Area | Decision |
|------|----------|
| SQLite | expo-sqlite + OPFS (same API as mobile) |
| Alerts | Custom modal system (AlertProvider) |
| Drag & Drop | @dnd-kit (cross-platform) |
| Responsive | Hybrid (centered container + responsive key screens) |
| Output | Single-page app (SPA) |
| Hosting | Vercel |
| Encryption | expo-crypto (already in project, uses Web Crypto API on web) |
| Target Browsers | Latest only (Chrome 102+, Safari 15.2+, Firefox 111+, Edge 102+) |

---

## Prerequisites

Before starting, ensure you understand:
- [Project Architecture](../development/ARCHITECTURE.md)
- [NativeWind Styling](../development/styling.md)
- Current state of native app (fully functional)

---

## Implementation Order

Execute phases sequentially:

1. **Foundation** - Install dependencies, configure Metro and app.json
2. **Assets** - Create PWA icons and manifest
3. **Components** - Replace incompatible native components
4. **Service Worker** - Configure offline caching
5. **Deployment** - Set up Vercel with required headers
6. **Responsive** - Add web-specific layouts
7. **Testing** - Verify all platforms work

---

## Quick Validation Commands

```bash
# After Phase 1
pnpm web              # Should start dev server

# After Phase 3
pnpm typecheck        # Should pass

# After Phase 4
pnpm web:build        # Should create dist/ folder

# After Phase 5
pnpm web:preview      # Should serve locally
```

---

## Browser Requirements

expo-sqlite with OPFS requires `SharedArrayBuffer`, which needs COOP/COEP headers:

| Browser | Minimum Version | OPFS Support |
|---------|-----------------|--------------|
| Chrome | 102+ | Yes |
| Safari | 15.4+ | Yes |
| Firefox | 111+ | Yes |
| Edge | 102+ | Yes |

---

## Need Help?

- Review [Web Compatibility Reference](./REFERENCE-WEB-GAPS.md) for detailed gap analysis
- Check [Expo PWA Documentation](https://docs.expo.dev/guides/progressive-web-apps/)
- Refer to [AGENTS.md](../../AGENTS.md) for project coding standards
