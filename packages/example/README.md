# Example NestJS Application

This example demonstrates how to use `nest-sequelize-query-builder` in a real NestJS application.

## Setup

```bash
# Install dependencies
npm install

# Run the application
npm run start:dev
```

The app will start at `http://localhost:3000` with sample data already seeded.

## Test Endpoints

### Basic Sorting
```bash
# Sort by name ascending
curl "http://localhost:3000/users?sort=name"

# Sort by name descending
curl "http://localhost:3000/users?sort=-name"

# Multiple sorts
curl "http://localhost:3000/users?sort=name,-createdAt"

# Sort by age
curl "http://localhost:3000/users?sort=age"
```

### Default Sorting
```bash
# Uses default sort by newest first
curl "http://localhost:3000/users/recent"

# Override with custom sort
curl "http://localhost:3000/users/recent?sort=name"
```

### Pagination
```bash
# Paginated results
curl "http://localhost:3000/users/paginated?sort=name&page=1&perPage=5"
```

### Custom Sorting
```bash
# Sort by custom logic (post count)
curl "http://localhost:3000/users/custom?sort=postCount"
```

### Error Handling
```bash
# Try to sort by non-allowed field (will throw InvalidSortQueryException)
curl "http://localhost:3000/users?sort=password"
```

## Models

- **User**: id, name, email, age, createdAt, updatedAt
- **Post**: id, title, content, likes, userId, createdAt, updatedAt

## Code Structure

```
src/
├── models/
│   ├── user.model.ts       # User Sequelize model
│   └── post.model.ts       # Post Sequelize model
├── users/
│   ├── users.controller.ts # Controller with QueryBuilder examples
│   └── users.module.ts
├── app.module.ts           # Main app module with Sequelize config
└── main.ts                 # Bootstrap & seed data
```
