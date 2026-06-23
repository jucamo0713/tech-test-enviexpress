# Shared Architecture

Shared contains reusable frontend building blocks:

- `components`: Atomic Design UI primitives and layouts.
- `models`: generic frontend models such as pagination.
- `value-objects`: lightweight frontend value helpers for representation and simple UI validation.
- `store`: root NgRx state, actions, reducers, selectors, and effects.
- `constants`, `directives`, `pipes`, `interfaces`: project-level reusable code.

Do not put context-specific state, DTOs, repositories, or API services in shared.
