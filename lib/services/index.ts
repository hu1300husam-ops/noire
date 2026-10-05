/**
 * NOIRÉ — Backend-Agnostic Service Layer Entrypoint
 *
 * UI and Server Components import data operations from `@/lib/services`.
 * Currently backed by `@/lib/mock-api`; swapping to a production REST/GraphQL/tRPC
 * implementation requires changing only this barrel or the underlying adapter.
 */
export * from '@/lib/mock-api';
