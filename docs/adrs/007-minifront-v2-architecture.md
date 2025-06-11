# ADR 007: Minifront v2 Architecture - Evolution and Modernization

Building upon the foundational architecture decisions outlined in [ADR 002: Client-side rendering + hash routing](./002-framework.md), minifront-v2 represents a significant architectural evolution while preserving the core privacy and deployment principles that guided the original design.

The original minifront established key principles:

- **Privacy preserving**: Maximally client-side to protect user privacy
- **Deployable by PD nodes**: Statically rendered without special server configuration
- **Hash routing**: Enabling deployment on generic static file servers

Minifront-v2 builds upon these foundations while addressing scalability, maintainability, and developer experience challenges encountered in the original implementation.

## Decision

### Preserved Core Principles

Minifront-v2 maintains **complete parity** with the original architecture's fundamental privacy and deployment characteristics:

1. **Client-side rendering**: Fully client-side React application with no server-side dependencies
2. **Hash routing**: Continues using React Router's hash router for deployment flexibility
3. **Static build output**: Single `index.html` deployable on any static file server
4. **Privacy-first**: No code-splitting by route to prevent network traffic analysis
5. **PD node compatibility**: Can be served directly by Penumbra daemon nodes

### Architectural Evolution

Minifront-v2 introduces several significant architectural improvements:

#### 1. Feature-Sliced Design (FSD) Architecture

```
src/
├── app/           # Application initialization & routing
├── pages/         # Route-level page components
├── widgets/       # Complex standalone UI widgets
├── features/      # Business logic features
├── entities/      # Business entities & domain logic
└── shared/        # Shared utilities, services, stores
```

**Benefits:**

- Clear separation of concerns by abstraction level
- Improved scalability for larger feature sets
- Better code organization and discoverability
- Reduced coupling between components

#### 2. MobX State Management

**Divergence from original**: Replaces Zustand + TanStack Query with MobX stores

```typescript
// Original pattern (Zustand slice)
export const useBalancesStore = create<BalancesSlice>((set, get) => ({
  balances: [],
  loading: false,
  // ... manual state management
}));

// v2 pattern (MobX store)
export class BalancesStore {
  @observable balances: Balance[] = [];
  @observable loading = false;

  @computed get balancesByAccount() {
    // Automatically memoized computed values
  }
}
```

**Benefits:**

- **Performance**: Granular reactivity - only components observing changed data re-render
- **Developer Experience**: Direct state mutations with automatic change detection
- **Type Safety**: Full TypeScript inference without boilerplate
- **Computed Values**: Memoized derivations that update only when dependencies change

#### 3. Service Layer Architecture

**New addition**: Centralized service layer for business logic separation

```typescript
// Services handle data operations
export class PenumbraService {
  async getBalances(): Promise<Balance[]> {
    // gRPC communication logic
  }
}

// Stores handle state management
export class BalancesStore {
  constructor(private service: PenumbraService) {}

  async loadBalances() {
    this.balances = await this.service.getBalances();
  }
}
```

**Benefits:**

- Clean separation between data access and state management
- Improved testability through dependency injection
- Reusable business logic across stores
- Easier mocking for testing

#### 4. Dependency Injection Pattern

**New addition**: Root store pattern with dependency injection

```typescript
export class RootStore {
  readonly balancesStore: BalancesStore;
  readonly transactionsStore: TransactionsStore;

  constructor(private penumbraService: PenumbraService) {
    this.balancesStore = new BalancesStore(this, penumbraService);
    this.transactionsStore = new TransactionsStore(this, penumbraService);
  }
}
```

**Benefits:**

- Centralized configuration and initialization
- Cross-store communication through shared root
- Easier testing with mock services
- Clear application lifecycle management

### Technical Stack Evolution

| Aspect               | Original Minifront           | Minifront v2            | Reasoning                                            |
| -------------------- | ---------------------------- | ----------------------- | ---------------------------------------------------- |
| **Routing**          | React Router (hash)          | React Router (hash)     | ✅ **Parity**: Maintains deployment flexibility      |
| **Build Tool**       | Vite                         | Vite                    | ✅ **Parity**: Continues fast development experience |
| **State Management** | Zustand + TanStack Query     | MobX                    | 🔄 **Evolution**: Better performance & DX            |
| **Architecture**     | Component-based              | Feature-Sliced Design   | 🔄 **Evolution**: Improved scalability               |
| **Services**         | Direct in components         | Dedicated service layer | ➕ **Addition**: Better separation of concerns       |
| **UI Library**       | @penumbra-zone/ui-deprecated | @penumbra-zone/ui       | 🔄 **Migration**: Complete UI library change         |
| **CSS Framework**    | Tailwind                     | Tailwind                | ✅ **Parity**: Consistent styling approach           |
| **TypeScript**       | TypeScript                   | TypeScript              | ✅ **Parity**: Type safety maintained                |

### UI Component Strategy

**Major divergence**: Complete migration from `@penumbra-zone/ui-deprecated` to `@penumbra-zone/ui`

```typescript
// Original minifront (ui-deprecated)
import { Button } from '@penumbra-zone/ui-deprecated/components/ui/button';
import { Card } from '@penumbra-zone/ui-deprecated/components/ui/card';
import '@penumbra-zone/ui-deprecated/styles/globals.css';

// Minifront-v2 (new ui library)
import { Button } from '@penumbra-zone/ui/Button';
import { Card } from '@penumbra-zone/ui/Card';
import '@penumbra-zone/ui/style.css';

// Plus v2-specific UI components
import { TransactionCard } from '@/shared/ui/transaction-card';
```

This represents a **complete UI library migration**, not preservation of existing patterns.

## Rationale

### Why MobX over Zustand + TanStack Query?

1. **Performance**: MobX's fine-grained reactivity eliminates unnecessary re-renders that were challenging to optimize with Zustand
2. **Simplicity**: Direct state mutations are more intuitive than immutable update patterns
3. **Computed Values**: Automatic memoization reduces boilerplate compared to manual selectors
4. **TypeScript Integration**: Better inference without complex generic types

### Why Feature-Sliced Design?

1. **Scalability**: As minifront grows, FSD provides clear guidelines for organizing features
2. **Team Collaboration**: Clear boundaries reduce conflicts in larger development teams
3. **Maintainability**: Business logic grouped by domain rather than technical concerns
4. **Discoverability**: Developers can quickly locate relevant code

### Why Service Layer?

1. **Testability**: Easy to mock data operations without complex component testing
2. **Reusability**: Business logic can be shared across multiple stores
3. **Separation of Concerns**: Stores focus on state, services focus on data operations
4. **Migration Path**: Easier to adapt to future backend changes

## Consequences

### Positive

1. **Maintained Privacy Guarantees**: All original privacy protections preserved
2. **Improved Performance**: MobX's reactive system reduces unnecessary renders
3. **Better Developer Experience**: Less boilerplate, better TypeScript support
4. **Enhanced Maintainability**: Clear architectural boundaries and separation of concerns
5. **Preserved Deployment Model**: Still deployable by any PD node or static server

### Potential Concerns

1. **Learning Curve**: Team members need to learn MobX patterns and FSD architecture
2. **Bundle Size**: MobX adds ~50KB to bundle (vs ~20KB for Zustand), but removes TanStack Query (~40KB)
3. **Migration Effort**: Existing features need gradual migration from v1 patterns

### Migration Strategy

1. **Gradual Migration**: v2 exists alongside v1, allowing incremental feature migration
2. **UI Library Migration**: Complete transition from ui-deprecated to modern ui library
3. **Feature Parity**: Ensure all v1 functionality is replicated before deprecation
4. **Documentation**: Comprehensive guides for new patterns and architecture
5. **Component Redesign**: Rebuild UI components using new design system

## Future Considerations

### Potential Further Evolution

1. **Remix SPA Mode**: As mentioned in ADR 002, future consideration for React Router's successor
2. **Web Workers**: Potential for moving heavy computations off main thread while maintaining privacy
3. **Progressive Enhancement**: Opportunity for offline-first capabilities
4. **Module Federation**: Potential for micro-frontend architecture if needed

### Constraints to Maintain

1. **Hash Routing**: Must preserve for deployment flexibility
2. **Client-side Only**: No server-side rendering to maintain privacy guarantees
3. **Single Bundle**: No route-based code splitting to prevent traffic analysis
4. **Static Deployment**: Must remain deployable on any static file server

## Implementation Status and Limitations

### Current State (Phase 1)

**✅ Architecturally Complete:**

- Hash routing implemented (`createHashRouter`)
- Client-side only rendering (no SSR)
- No code-splitting or dynamic imports
- MobX store architecture functional
- Feature-Sliced Design structure in place

**❌ Deployment Incomplete:**

- **Missing production build configuration** - no `build` script in package.json
- Cannot currently be deployed by PD nodes (build process not configured)
- Development-only setup (only `dev:app` script available)

### Remaining Work

1. **Phase 1 Completion**: Add production build configuration

   - Configure `vite build` script
   - Ensure static output works with PD node deployment
   - Verify privacy constraints are maintained in production build

2. **Phase 2**: Feature parity with original minifront
3. **Phase 3**: Enhanced features leveraging new architecture
4. **Phase 4**: Deprecation of original minifront

## Important Note

While this ADR documents the architectural _intent_ and _design_ of minifront-v2, **the application is not yet production-ready**. The core privacy-preserving principles are architecturally sound, but the deployment guarantees outlined in ADR 002 cannot be fulfilled until the production build process is completed.

This architecture decision establishes the foundation for maintaining Penumbra's privacy-preserving and deployment-friendly principles while modernizing the development experience and application architecture.
