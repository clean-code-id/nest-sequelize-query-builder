# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** containing a NestJS query builder package for Sequelize ORM, inspired by Spatie's Laravel Query Builder. The workspace uses **npm workspaces** to manage multiple packages.

**Package Name:** `@cleancode-id/nestjs-sequelize-query-builder`

### Workspace Structure

```
/
├── packages/
│   ├── core/          # The actual publishable package
│   └── example/       # Example NestJS app for testing (private)
├── package.json       # Workspace root configuration
└── node_modules/      # Hoisted dependencies (shared across packages)
```

## Key Commands

### Development Workflow

```bash
# Build the core package
npm run build

# Run example app (dev mode with watch)
npm run example:dev

# Run example app (production mode)
npm run example:start

# Run tests (core package)
npm run test

# Publish to npm (dry run)
npm run publish:dry

# Publish to npm (production)
npm run publish:prod
```

### Working in Individual Packages

```bash
# Build core package directly
cd packages/core
npm run build

# Watch mode for development
cd packages/core
npm run watch

# Run tests with watch mode
cd packages/core
npm run test:watch
```

## Architecture

### Core Package (`packages/core/`)

The core package exports a fluent QueryBuilder API for Sequelize with the following components:

**Main Exports:**
- `QueryBuilder` - Main query builder class with chainable methods
- `AllowedSort` - Helper class for defining sort configurations
- `QueryBuilderParams` - NestJS decorator to extract query parameters
- `InvalidSortQueryException` - Custom exception for invalid sorts

**Key Design Patterns:**

1. **Fluent Builder Pattern**: `QueryBuilder.for(Model).allowedSorts(...).applySorts(params).get()`

2. **Security-First**: Only explicitly allowed sorts/filters are permitted. Attempting to use non-allowed fields throws `InvalidSortQueryException` with HTTP 400.

3. **Custom Sort Logic**: `AllowedSort.custom()` allows defining complex sorting behavior (e.g., sorting by aggregated columns, related model fields).

4. **Pagination Support**: `paginate(page, perPage)` method handles both simple queries and GROUP BY queries (which return array counts).

### Exception Handling

**IMPORTANT**: The package uses `@nestjs/common` as a **peer dependency** to avoid the instanceof problem across package boundaries.

- Core package declares `@nestjs/common` in `peerDependencies` only
- Example app provides the actual `@nestjs/common` installation
- Both packages resolve to the **same** `@nestjs/common` instance in the hoisted `node_modules/`

This ensures that exceptions thrown from the core package are properly recognized by NestJS exception filters in the consuming application.

### Example App (`packages/example/`)

Demonstrates real-world usage with:
- SQLite in-memory database
- Sequelize-TypeScript models (User, Post)
- Folder-by-feature structure (`user/`, `post/`)
- Custom sort by aggregated column (`postCount`)
- Optional pagination (controlled by `?page=` param)
- Database seeding on startup

## Testing the Package Locally

The example app uses `"@cleancode-id/nestjs-sequelize-query-builder": "*"` which resolves to the workspace core package automatically via npm workspaces.

**Workflow:**
1. Make changes to `packages/core/src/`
2. Build: `npm run build`
3. Restart example: `npm run example:dev`
4. Test endpoints: `http://localhost:3000/users?sort=-name`

## TypeScript Configuration

- **Target**: ES2021
- **Module**: CommonJS (for npm package compatibility)
- **Decorators**: Enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- **Output**: `packages/core/dist/` with declaration files

## Common Patterns in This Codebase

### Custom Sorting with Aggregations

When sorting by aggregated columns (e.g., post count), use `AllowedSort.custom()`:

```typescript
AllowedSort.custom("postCount", (query, direction) => {
  return {
    ...query,
    order: [[Sequelize.literal("postCount"), direction]],
  };
})
```

Ensure the base query includes the aggregation in `attributes.include`.

### Handling GROUP BY Pagination

When using `group` in Sequelize queries, `findAndCountAll` returns an array of counts instead of a single number. The `paginate()` method handles this:

```typescript
const total = Array.isArray(count) ? count.length : count;
```

### Parsing Multiple Sorts

The package supports comma-separated sorts: `?sort=name,-createdAt`

Parsing logic splits by comma and handles `-` prefix for descending order.

## Publishing to npm

1. Ensure changes are committed
2. Update version in `packages/core/package.json`
3. Run dry-run: `npm run publish:dry`
4. If successful: `npm run publish:prod`

The package is published with `--access public` for scoped packages.
