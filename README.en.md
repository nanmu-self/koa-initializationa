# Koa CLI Generator

A command-line tool for generating Koa.js project scaffolds, similar to vue-cli.

## Features

- 🚀 Quick project scaffolding
- 📦 Multiple project templates (basic, API, fullstack)
- 🔧 Configurable feature modules
- 📝 TypeScript support
- 🎯 Interactive CLI prompts
- 🔄 Automatic dependency management
- 📋 Configuration file support

## Installation

```bash
npm install -g koa-cli-generator
```

## Usage

### Create a new project

```bash
koa create my-project
```

### Create with specific template

```bash
koa create my-api --template api
```

### Create with configuration file

```bash
koa create my-project --config koa.config.json
```

### Update CLI and templates

```bash
koa update
```

### Show version information

```bash
koa version
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
src/
├── cli.ts              # CLI entry point
├── index.ts            # Main export file
├── types/              # TypeScript type definitions
├── commands/           # Command handlers
├── utils/              # Utility functions
├── core/               # Core business logic
└── test/               # Test setup and utilities
```

## License

MIT