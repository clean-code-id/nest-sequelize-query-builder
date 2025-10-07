# NestJS Sequelize Query Builder

A NestJS query builder for Sequelize ORM with filtering, sorting, and more - inspired by [Spatie Laravel Query Builder](https://spatie.be/docs/laravel-query-builder).

## Features

- ✅ **Sorting** - Sort by multiple fields with ascending/descending order
- ✅ **Custom Sorts** - Define custom sorting logic
- ✅ **Sort Validation** - Only allow predefined sorts for security
- ✅ **Default Sorting** - Fallback sorting when no sort parameter provided
- 🚧 **Filtering** - Coming soon
- 🚧 **Including Relations** - Coming soon

## Installation

```bash
npm install nest-sequelize-query-builder
```

## Quick Start

### Basic Usage

```typescript
import { Controller, Get } from '@nestjs/common';
import { QueryBuilder, QueryBuilderParams, AllowedSort } from 'nest-sequelize-query-builder';
import { User } from './models/user.model';

@Controller('users')
export class UsersController {
  @Get()
  async index(@QueryBuilderParams() params: any) {
    return QueryBuilder.for(User)
      .allowedSorts('name', 'email', 'createdAt')
      .applySorts(params)
      .get();
  }
}
```

**Request examples:**
```bash
GET /users?sort=name           # Sort by name ascending
GET /users?sort=-name          # Sort by name descending
GET /users?sort=name,-createdAt # Sort by name asc, then createdAt desc
```

### Default Sorting

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .defaultSort('-createdAt')  // Default sort by newest first
    .allowedSorts('name', 'email', 'createdAt')
    .applySorts(params)
    .get();
}
```

### Sort Aliases

Map request parameter names to different database columns:

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .allowedSorts(
      'name',
      AllowedSort.field('email', 'email_address'), // 'email' → 'email_address' column
    )
    .applySorts(params)
    .get();
}
```

### Custom Sort Logic

Define complex sorting behavior:

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .allowedSorts(
      'name',
      AllowedSort.custom('popular', (query, direction) => {
        // Custom sorting logic
        return {
          ...query,
          order: [[{ model: Post, as: 'posts' }, 'likes', direction]],
        };
      }),
    )
    .applySorts(params)
    .get();
}
```

### Pagination

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.perPage) || 15;

  return QueryBuilder.for(User)
    .allowedSorts('name', 'createdAt')
    .applySorts(params)
    .paginate(page, perPage);
}
```

Response:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "perPage": 15
}
```

## API Reference

### QueryBuilder Methods

| Method | Description |
|--------|-------------|
| `QueryBuilder.for(Model)` | Create new QueryBuilder instance |
| `.allowedSorts(...sorts)` | Define which sorts are allowed |
| `.defaultSort(...sorts)` | Set default sorting |
| `.applySorts(params)` | Apply sorting from query params |
| `.build()` | Get Sequelize FindOptions |
| `.get()` | Execute query and return results |
| `.paginate(page, perPage)` | Execute with pagination |
| `.first()` | Get first result |

### AllowedSort Helpers

| Method | Description |
|--------|-------------|
| `AllowedSort.field(name, column?)` | Simple field sort with optional alias |
| `AllowedSort.custom(name, fn)` | Custom sort with logic function |
| `AllowedSort.fields(...names)` | Create multiple field sorts |

## Security

Only explicitly allowed sorts can be used. Attempting to sort by non-allowed fields throws `InvalidSortQueryException`:

```typescript
// Only 'name' is allowed
QueryBuilder.for(User)
  .allowedSorts('name')
  .applySorts({ sort: 'email' }); // ❌ Throws InvalidSortQueryException
```

## Testing Locally

```bash
# In this package directory
npm link

# In your NestJS project
npm link nest-sequelize-query-builder
```

Or use the example app in the `example/` directory.

## License

MIT
