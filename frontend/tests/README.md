# Frontend Tests

The frontend test tree mirrors the application architecture and follows the backend test organization style, adapted to Angular.

```txt
tests/
  units/
    app/
    core/
    shared/
    contexts/
      auth/
      products/
      users/
  e2e/
    contexts/
      auth/
      products/
      users/
  mothers-and-mocks/
    contexts/
      auth/
      products/
      users/
    shared/
```

## Rules

- Unit tests should mirror the source path they validate.
- Context tests live under `tests/units/contexts/context-name`.
- Component/page tests belong under the context `presentation` test folder.
- Facade, handler, command, query, and service tests belong under `application`.
- DTO, mapper, repository, and API adapter tests belong under `infrastructure`.
- Lightweight model and value-object tests belong under `domain`.
- Test data builders, mothers, mocks, and stubs belong under `mothers-and-mocks`.

