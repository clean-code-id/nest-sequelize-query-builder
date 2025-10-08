# NestJS Sequelize Query Builder

This is a monorepo workspace containing the NestJS Sequelize Query Builder package.

## Package

The main package is located in [`packages/core/`](./packages/core/README.md).

📦 **npm**: [@cleancode-id/nestjs-sequelize-query-builder](https://www.npmjs.com/package/@cleancode-id/nestjs-sequelize-query-builder)

## Quick Links

- [📖 Documentation](./packages/core/README.md)
- [💡 Examples](./packages/example/)
- [🚀 Deployment Guide](./DEPLOYMENT.md)

## Installation

```bash
npm install @cleancode-id/nestjs-sequelize-query-builder
```

## Development

```bash
# Install dependencies
npm install

# Build the core package
npm run build

# Run example app
npm run example:dev

# Run tests
npm run test

# Deploy to npm
npm run deploy
```

## Repository Structure

```
/
├── packages/
│   ├── core/          # The publishable package
│   └── example/       # Example NestJS app
├── scripts/
│   └── publish.sh     # Deployment script
└── DEPLOYMENT.md      # Deployment guide
```

## Contributing

See [CONTRIBUTING](./packages/core/README.md#-contributing) for details.

## License

MIT - see [LICENSE](./LICENSE) for details.

---

Built with ❤️ by [Clean Code Indonesia](https://cleancode.id)
