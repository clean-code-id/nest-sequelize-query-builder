# NestJS Sequelize Query Builder

![npm version](https://img.shields.io/npm/v/@cleancode-id/nestjs-sequelize-query-builder)
![npm downloads](https://img.shields.io/npm/dm/@cleancode-id/nestjs-sequelize-query-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Build Sequelize queries from API requests with a clean, secure, and intuitive API. Inspired by [Spatie's Laravel Query Builder](https://github.com/spatie/laravel-query-builder).

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .allowedSorts('name', 'email', 'createdAt')
    .defaultSort('-createdAt')
    .applySorts(params)
    .paginate(params.page, params.perPage);
}
```

**Request examples:**
```bash
GET /users?sort=name              # Sort by name ascending
GET /users?sort=-createdAt        # Sort by newest first
GET /users?sort=name,-createdAt   # Multiple sorts
GET /users?sort=name&page=2&size=10  # With pagination
```

## Features

- ✅ Sorting (single and multiple fields)
- ✅ Custom sort logic for complex queries
- ✅ Security-first validation (only allowed sorts)
- ✅ Default sorting fallback
- ✅ Pagination with `GROUP BY` support
- ✅ Sort aliases (map API names to DB columns)
- 🚧 Filtering (coming soon)
- 🚧 Including relations (coming soon)

## Table of Contents

- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage](#-usage)
  - [Default Sorting](#default-sorting)
  - [Sort Aliases](#sort-aliases)
  - [Custom Sort Logic](#custom-sort-logic)
  - [Pagination](#pagination)
  - [Advanced Queries](#advanced-queries)
- [📚 API Reference](#-api-reference)
- [🔒 Security](#-security)
- [💡 Examples](#-examples)
- [🧪 Testing Locally](#-testing-locally)
- [🤝 Contributing](#-contributing)
- [✨ Credits](#-credits)
- [📄 License](#-license)
- [💬 Support](#-support)
- [🙏 Acknowledgments](#-acknowledgments)

## 📦 Installation

```bash
npm install @cleancode-id/nestjs-sequelize-query-builder
```

**Requirements:**
- NestJS 10.x or higher
- Sequelize 6.x or higher
- sequelize-typescript 2.x or higher

## 🚀 Quick Start

```typescript
import { Controller, Get } from '@nestjs/common';
import { QueryBuilder, QueryBuilderParams } from '@cleancode-id/nestjs-sequelize-query-builder';
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

```bash
GET /users?sort=name           # Ascending by name
GET /users?sort=-name          # Descending by name
GET /users?sort=age,-createdAt # Age asc, then createdAt desc
```

## 📖 Usage

### Default Sorting

Set a fallback sort when no `sort` parameter is provided:

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .defaultSort('-createdAt')  // Default to newest first
    .allowedSorts('name', 'email', 'createdAt')
    .applySorts(params)
    .get();
}
```

**Note:** `allowedSorts()` must be called before `applySorts()` to properly validate the default sort.

### Sort Aliases

Map API parameter names to different database column names:

```typescript
import { AllowedSort } from '@cleancode-id/nestjs-sequelize-query-builder';

@Get()
async index(@QueryBuilderParams() params: any) {
  return QueryBuilder.for(User)
    .allowedSorts(
      'name',
      AllowedSort.field('email', 'email_address'), // API: 'email' → DB: 'email_address'
    )
    .applySorts(params)
    .get();
}
```

```bash
GET /users?sort=email  # Actually sorts by 'email_address' column
```

### Custom Sort Logic

Define complex sorting behavior for aggregated columns, related models, or computed fields:

```typescript
import { AllowedSort } from '@cleancode-id/nestjs-sequelize-query-builder';
import { Sequelize } from 'sequelize-typescript';

@Get()
async index(@QueryBuilderParams() params: any) {
  const baseQuery = {
    include: [{ model: Post, as: 'posts' }],
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('posts.id')), 'postCount']
      ]
    },
    group: ['User.id'],
    subQuery: false,
  };

  return QueryBuilder.for(User, baseQuery)
    .allowedSorts(
      'name',
      AllowedSort.custom('postCount', (query, direction) => {
        return {
          ...query,
          order: [[Sequelize.literal('postCount'), direction]],
        };
      })
    )
    .applySorts(params)
    .get();
}
```

```bash
GET /users?sort=-postCount  # Sort by post count, descending
```

### Pagination

Use the `paginate()` method for paginated results:

```typescript
@Get()
async index(@QueryBuilderParams() params: any) {
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.size) || 15;

  return QueryBuilder.for(User)
    .allowedSorts('name', 'createdAt')
    .applySorts(params)
    .paginate(page, perPage);
}
```

```bash
GET /users?sort=name&page=2&size=10
```

**Response:**
```json
{
  "data": [...],
  "total": 50,
  "page": 2,
  "perPage": 10
}
```

**Note:** The `paginate()` method correctly handles queries with `GROUP BY` clauses.

### Advanced Queries

**Combining with existing Sequelize options:**

```typescript
const baseQuery = {
  where: { isActive: true },
  include: [{ model: Profile, as: 'profile' }],
};

return QueryBuilder.for(User, baseQuery)
  .allowedSorts('name', 'createdAt')
  .applySorts(params)
  .get();
```

**Getting the Sequelize query without executing:**

```typescript
const findOptions = QueryBuilder.for(User)
  .allowedSorts('name')
  .applySorts(params)
  .build();

const users = await User.findAll(findOptions);
```

**Getting the first result:**

```typescript
const user = await QueryBuilder.for(User)
  .allowedSorts('createdAt')
  .applySorts(params)
  .first();
```

## 📚 API Reference

### QueryBuilder Methods

| Method | Description |
|--------|-------------|
| `QueryBuilder.for(Model, baseQuery?)` | Create new QueryBuilder instance |
| `.allowedSorts(...sorts)` | Define which sorts are allowed (strings or `AllowedSort` objects) |
| `.defaultSort(...sorts)` | Set default sorting (applied when no `sort` param) |
| `.applySorts(params)` | Apply sorting from query params |
| `.build()` | Get Sequelize `FindOptions` without executing |
| `.get()` | Execute query and return results |
| `.paginate(page, perPage)` | Execute with pagination, returns `{ data, total, page, perPage }` |
| `.first()` | Get first result only |

### AllowedSort Helpers

| Method | Description |
|--------|-------------|
| `AllowedSort.field(name, column?)` | Simple field sort with optional column alias |
| `AllowedSort.custom(name, fn)` | Custom sort with logic function `(query, direction) => FindOptions` |

### Decorators

| Decorator | Description |
|-----------|-------------|
| `@QueryBuilderParams()` | Extract query parameters from request |

### Exceptions

| Exception | Status Code | Description |
|-----------|-------------|-------------|
| `InvalidSortQueryException` | 400 | Thrown when attempting to sort by a field not in `allowedSorts()` |

## 🔒 Security

**Only explicitly allowed sorts can be used.** This prevents users from sorting by sensitive or non-indexed columns.

```typescript
QueryBuilder.for(User)
  .allowedSorts('name', 'email')
  .applySorts({ sort: 'password' }); // ❌ Throws InvalidSortQueryException (400)
```

The exception includes details about which field was invalid, which sorts are allowed, and suggestions for fixing the request.

## 💡 Examples

See the [example app](./packages/example) for a complete working NestJS application demonstrating:

- Basic sorting by model fields
- Custom sorting by aggregated columns (`postCount`)
- Optional pagination
- Database seeding
- Error handling

**Run the example:**

```bash
# Clone and install
git clone https://github.com/clean-code-id/nest-sequelize-query-builder
cd nest-sequelize-query-builder
npm install

# Run example app
npm run example:dev

# Test the API
curl http://localhost:3000/users?sort=-name
```

## 🧪 Testing Locally

**Option 1: npm link**
```bash
# In this package directory
npm link

# In your NestJS project
npm link @cleancode-id/nestjs-sequelize-query-builder
```

**Option 2: Run tests**
```bash
npm test           # Run tests
npm run test:watch # Watch mode
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Ensure all tests pass and code follows the existing style.

## ✨ Credits

This package is inspired by [Spatie's Laravel Query Builder](https://github.com/spatie/laravel-query-builder). Special thanks to the Spatie team for their excellent work.

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 💬 Support

- Security vulnerabilities: [your-email@example.com]
- Bugs and features: [Open an issue](https://github.com/clean-code-id/nest-sequelize-query-builder/issues)

## 🙏 Acknowledgments

Built with ❤️ by [Clean Code Indonesia](https://cleancode.id)