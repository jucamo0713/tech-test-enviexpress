# Shared UI And Atomic Design

Shared visual components use Flowbite and Tailwind as the visual base.

```txt
components/
  atoms/
  molecules/
  organisms/
  templates/
```

## Rules

- Atoms and molecules are reusable and presentation-only.
- Organisms may coordinate presentation state but must not call HTTP directly.
- Pages live inside contexts and connect to facades.
- Prefer Flowbite classes and patterns before adding custom CSS.
- Keep context-specific components inside the context presentation layer.
