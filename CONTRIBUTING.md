# Contributing to courier-hub

Thanks for your interest in contributing to **courier-hub**. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

## About This Repository

**courier-hub** is a zero-dependency, type-safe SDK that unifies multiple Bangladeshi courier services (like Pathao and Steadfast) under a single, consistent API. It is built to save developers from writing and maintaining separate integration code for every courier provider.

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/courier-hub.git
```

### Create a new Branch

```bash
git checkout -b my-branch-name
```

### Install dependencies

```bash
pnpm install
```

### Useful scripts

| Command            | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm build`       | Build the ESM + CJS bundles and type declarations into `dist/`     |
| `pnpm typecheck`   | Run the TypeScript compiler without emitting files                 |
| `pnpm test`        | Run the test suite once with Vitest                                |
| `pnpm lint`        | Lint `src/` and `tests/` with oxlint                               |
| `pnpm format`      | Format `src/` and `tests/` with Prettier                           |
| `pnpm format:check`| Check formatting without writing any changes                       |

A pre-commit hook runs `format:check`, `lint` and `test` automatically, so make sure they all pass before committing.

## Project Structure

```
src/
├── core/        # CourierHub facade that wires every provider together
├── providers/   # One file per courier (pathao.ts, steadfast.ts, ...) plus the barrel export
├── types/       # Shared config, request and response types
├── version.ts   # Package version
└── index.ts     # Public entry point
tests/           # Vitest specs, one file per provider
```

## Adding a new provider

1. Add the provider types in `src/types/<provider>.types.ts`.
2. Implement the client in `src/providers/<provider>.ts` with a default export.
3. Re-export the class and its config type from `src/providers/index.ts`.
4. Wire it into `CourierHub` in `src/core/courier-hub.ts` and extend `CourierHubConfig`.
5. Add a matching `tests/<provider>.test.ts` using a mocked `fetch`.

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention `category(scope or module): message` in your commit message while using one of the following categories:

| Category   | Use for                                                        |
| ---------- | -------------------------------------------------------------- |
| `feat`     | A new feature                                                  |
| `fix`      | A bug fix                                                      |
| `docs`     | Documentation only changes                                     |
| `refactor` | A code change that neither fixes a bug nor adds a feature      |
| `test`     | Adding or updating tests                                       |
| `chore`    | Build tooling, dependencies and other maintenance              |
| `perf`     | A code change that improves performance                        |
| `style`    | Changes that do not affect the meaning of the code (formatting)|
| `build`    | Changes to the build system or dependencies                    |
| `ci`       | Changes to CI configuration                                    |

Example:

```
feat(providers): add RedX courier support
fix(pathao): refresh the token before it expires
docs: add single-provider usage example
```

## Pull Requests

- Keep the pull request focused on a single change.
- Make sure `pnpm build`, `pnpm typecheck`, `pnpm test` and `pnpm lint` all pass.
- Link the related issue and describe what changed and why.
- Update the README and this document if your change affects usage or workflow.
