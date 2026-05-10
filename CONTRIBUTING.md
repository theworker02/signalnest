# Contributing

SignalNest is not currently seeking outside contributions.

This repository is being developed as a controlled product prototype, so pull
requests, feature requests, community roadmap proposals, design submissions,
and drive-by refactors are not being reviewed or accepted at this time.

## Current policy

- External contributions are not being solicited.
- Pull requests may be closed without review.
- Issues may be disabled, ignored, or used only for internal tracking.
- Forks are permitted under the project license, but they are not a signal that upstream maintainers will review or merge changes.

## Internal development standards

For maintainers working directly in this repository:

- Keep frontend, backend, database, and docs changes scoped to the task.
- Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` before shipping meaningful changes.
- Keep UI controls functional and keyboard-accessible.
- Avoid placeholder pages, dead actions, decorative-only widgets, and fake integrations.
- Never commit secrets. Use `.env.example` for names and documentation only.

## License

SignalNest is licensed under the Apache License 2.0. See `LICENSE`.
