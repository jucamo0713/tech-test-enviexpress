# Core Architecture

Core contains cross-cutting frontend infrastructure inspired by the backend template:

- `cqrs`: typed commands, queries, events, handlers, buses, and `CqrsCallerService`.
- `http`: HTTP interceptors for auth tokens, request IDs, timeout, and error mapping.
- `errors`: normalized frontend errors compatible with backend exception responses.
- `config`: application configuration tokens.
- `i18n`: Angular i18n locale providers and supported locale metadata.
- `utils`: framework integration helpers such as Flowbite initialization.

Core must stay context-agnostic. Context logic belongs under `contexts/context-name`.
