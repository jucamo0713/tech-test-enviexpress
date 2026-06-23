# Context Architecture Template

Frontend contexts mirror the backend bounded contexts conceptually. A context owns its UI state, presentation models, application orchestration, HTTP adapters, DTOs, and mappers for one business area.

Current starter contexts match the backend template:

- `auth`
- `products`
- `users`

Use this structure inside each context when the layer is needed:

```txt
context-name/
  domain/
    entities/
    value-objects/
    models/
  application/
    commands/
    queries/
    events/
    handlers/
    services/
    facades/
  infrastructure/
    api/
    dto/
    mappers/
    repositories/
  presentation/
    pages/
    templates/
    organisms/
    molecules/
    atoms/
    components/
  routes.ts
  context.actions.ts
  context.reducer.ts
  context.effects.ts
  context.selectors.ts
  context.store.ts
```

## Rules

- Pages depend on facades.
- Facades orchestrate CQRS, NgRx actions/selectors, and application services.
- Components do not call HTTP services directly.
- Components do not use `CommandBus`, `QueryBus`, or `Store` directly when a facade can expose the workflow.
- Infrastructure owns API services, repositories, DTOs, and mappers.
- DTOs represent API contracts. UI/domain models represent frontend state and rendering needs.
- Mappers must stay light: no backend business rules belong in the frontend.
- Use lazy loaded `routes.ts` files for context routing when a context has pages.
- Keep context-specific UI inside `presentation`; keep reusable UI in `shared/components`.

