# Deployment Guide

This guide explains how to deploy the package to npm.

## Prerequisites

1. **npm Account**: You must have an npm account with access to publish `@cleancode-id` scoped packages
2. **npm Login**: Run `npm login` to authenticate
3. **Clean Git State**: Ensure all changes are committed
4. **Tests Pass**: All tests must pass before deployment

## Deployment Script

The deployment script (`scripts/publish.sh`) automates the entire publishing process:

### What it does:

1. ✅ Checks git working directory is clean
2. ✅ Prompts for version bump type
3. ✅ Updates version in `packages/core/package.json` and root `package.json`
4. ✅ Runs tests
5. ✅ Builds the package
6. ✅ Runs dry-run publish
7. ✅ Asks for confirmation
8. ✅ Publishes to npm
9. ✅ Creates git commit and tag
10. ✅ Shows next steps

## How to Deploy

### Quick Deploy

```bash
npm run deploy
```

Then follow the interactive prompts:

```
Current version: 0.1.0

Select version bump type:
  1) patch (0.1.0 -> 0.1.1)
  2) minor (0.1.0 -> 0.2.0)
  3) major (0.1.0 -> 1.0.0)
  4) custom
  5) no version bump (publish current version)

Enter choice [1-5]:
```

### Version Bump Types

- **Patch** (0.1.0 → 0.1.1): Bug fixes, minor improvements
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes
- **Custom**: Specify any version (e.g., 1.0.0-beta.1)
- **No bump**: Publish current version (use with caution)

### After Deployment

Once the script completes, push your changes and tags:

```bash
git push && git push --tags
```

## Manual Deployment (Not Recommended)

If you need to deploy manually:

```bash
# 1. Bump version
cd packages/core
npm version patch  # or minor, major

# 2. Update root package.json version manually

# 3. Run tests
npm test

# 4. Build
npm run build

# 5. Dry run
npm run publish:dry

# 6. Publish
npm run publish:prod

# 7. Commit and tag
git add .
git commit -m "chore: release vX.Y.Z"
git tag -a "vX.Y.Z" -m "Release vX.Y.Z"
git push && git push --tags
```

## Verify Deployment

After publishing, verify the package:

1. Check npm: https://www.npmjs.com/package/@cleancode-id/nestjs-sequelize-query-builder
2. Install in a test project:
   ```bash
   npm install @cleancode-id/nestjs-sequelize-query-builder
   ```

## Rollback

If you need to rollback a published version:

```bash
# Deprecate a version (doesn't unpublish, but warns users)
npm deprecate @cleancode-id/nestjs-sequelize-query-builder@X.Y.Z "Version deprecated due to [reason]"

# Unpublish (only within 72 hours, use with extreme caution)
npm unpublish @cleancode-id/nestjs-sequelize-query-builder@X.Y.Z
```

## Troubleshooting

### "Git working directory is not clean"

Commit or stash your changes:

```bash
git add .
git commit -m "your message"
# or
git stash
```

### "Tests failed"

Fix failing tests before deploying:

```bash
npm test
```

### "Permission denied"

Ensure you're logged in and have publish permissions:

```bash
npm login
npm whoami
```

### "Version already exists"

You cannot republish an existing version. Bump the version:

```bash
npm run deploy
# Choose a version bump option
```

## Best Practices

1. **Always test before deploying**: Run `npm test` locally
2. **Use semantic versioning**: Follow semver principles
3. **Write changelogs**: Document what changed in each release
4. **Test the published package**: Install and test in a real project
5. **Tag releases**: Git tags help track releases
6. **Never force publish**: If it fails, investigate why

## Release Checklist

- [ ] All tests passing
- [ ] Documentation updated (README, CHANGELOG)
- [ ] Breaking changes documented
- [ ] Git working directory clean
- [ ] Logged into npm
- [ ] Version number makes sense
- [ ] CLAUDE.md updated if needed
- [ ] Example app tested with changes

## Support

For deployment issues, contact the maintainer or check:
- npm docs: https://docs.npmjs.com/cli/v10/commands/npm-publish
- Semantic versioning: https://semver.org/
