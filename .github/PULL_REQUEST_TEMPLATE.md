## Summary
<!-- Describe what this PR changes and why -->

## GitFlow Checklist
- [ ] Source branch follows GitFlow naming (`feature/*`, `bugfix/*`, `release/*`, `hotfix/*`, or `develop`)
- [ ] Target branch is correct (`develop` for features/fixes, `main` for releases/hotfixes)

## Verification
- [ ] Backend lint & tests pass (`cd Backend && npm run lint && npm test`)
- [ ] Frontend tests & build pass (`cd Frontend && npm test -- --watchAll=false && npm run build`)
- [ ] Dashboard tests & build pass (`cd dashboard && npm test -- --watchAll=false && npm run build`)
- [ ] Docker Compose / Dockerfiles updated if needed
