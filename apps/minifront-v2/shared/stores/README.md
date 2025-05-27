# MobX Store Architecture for Minifront v2

This directory contains the MobX-based state management architecture for minifront-v2. This represents a significant architectural improvement over the previous Zustand/TanStack Query approach, providing better performance, simpler state management, and improved developer experience.

## Architecture Overview

The store architecture follows the **Model-View-ViewModel (MVVM)** pattern with **dependency injection** for clean separation of concerns:

```
┌─────────────────┐
│   React Views   │ (Components)
│   (Observer)    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   MobX Stores   │ (ViewModels)
│   (Observable)  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Services      │ (Models)
│   (Business)    │
└─────────────────┘
```

## Store Structure

### Root Store (`root-store.ts`)

- **Purpose**: Central dependency injection container
- **Responsibilities**:
  - Initialize all domain stores
  - Provide access to services
  - Manage application lifecycle
  - Coordinate store interactions

### Domain Stores

#### 1. **BalancesStore** (`balances-store.ts`)

- **Purpose**: Manages account balances and related operations
- **Key Features**:
  - Real-time balance updates
  - Account filtering
  - Asset filtering
  - Computed balance groupings
  - Balance validation

#### 2. **TransactionsStore** (`transactions-store.ts`)

- **Purpose**: Manages transaction history and details
- **Key Features**:
  - Transaction streaming
  - Transaction lookup by hash
  - Height-based filtering
  - Transaction summaries
  - Recent transactions

#### 3. **AssetsStore** (`assets-store.ts`)

- **Purpose**: Manages asset metadata and information
- **Key Features**:
  - Asset metadata caching
  - Asset lookup by ID/symbol
  - Sorted asset lists
  - Native token identification

#### 4. **AppParametersStore** (`app-parameters-store.ts`)

- **Purpose**: Manages global application parameters
- **Key Features**:
  - Chain information
  - Gas prices
  - Staking parameters
  - Global configuration

### Service Layer

#### **PenumbraService** (`penumbra-service.ts`)

- **Purpose**: Centralized gRPC communication layer
- **Benefits**:
  - Clean abstraction over protobuf services
  - Error handling
  - Connection management
  - Type safety

## Usage Patterns

### 1. Basic Store Access

```tsx
import { observer } from 'mobx-react-lite';
import { useBalancesStore } from '@shared/stores/store-context';

const MyComponent = observer(() => {
  const balancesStore = useBalancesStore();

  if (balancesStore.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {balancesStore.balancesByAccount.map(account => (
        <div key={account.account}>
          Account {account.account}: {account.balances.length} assets
        </div>
      ))}
    </div>
  );
});
```

### 2. Store Actions

```tsx
const balancesStore = useBalancesStore();

// Filter by account
await balancesStore.setAccountFilter(1);

// Refresh data
await balancesStore.loadBalances();

// Access computed values
const totalAssets = balancesStore.uniqueAssets.length;
```

### 3. Cross-Store Coordination

```tsx
const MyComponent = observer(() => {
  const balancesStore = useBalancesStore();
  const assetsStore = useAssetsStore();

  // Stores can work together through computed values
  const enrichedBalances = balancesStore.balancesByAccount.map(account => ({
    ...account,
    // Get asset metadata from assets store
    enrichedBalances: account.balances.map(balance => ({
      balance,
      metadata: assetsStore.getAssetById(getAssetId(balance)),
    })),
  }));

  return <div>{/* render enriched data */}</div>;
});
```

## Key Benefits

### 1. **Performance**

- **Granular Reactivity**: Only components observing changed data re-render
- **Computed Values**: Memoized calculations that update only when dependencies change
- **Efficient Updates**: Minimal DOM updates through precise change detection

### 2. **Developer Experience**

- **Simple State Updates**: Direct mutations (with MobX handling immutability)
- **No Boilerplate**: Minimal setup compared to Redux/Zustand patterns
- **Excellent TypeScript**: Full type inference and checking

### 3. **Architecture**

- **Clear Separation**: Services handle data, stores handle state, components handle UI
- **Testability**: Easy to mock and test individual stores
- **Scalability**: Easy to add new stores and maintain existing ones

### 4. **Data Flow**

- **Unidirectional**: Clear data flow from services → stores → components
- **Reactive**: Automatic updates when data changes
- **Predictable**: Easy to understand when and why updates happen

## Best Practices

### 1. **Component Design**

```tsx
// ✅ Good: Observer component with focused responsibility
const BalanceCard = observer(({ accountId }: { accountId: number }) => {
  const balancesStore = useBalancesStore();
  const account = balancesStore.balancesByAccount.find(a => a.account === accountId);

  return <div>{/* render account */}</div>;
});

// ❌ Avoid: Non-observer components missing updates
const BalanceCard = ({ accountId }: { accountId: number }) => {
  const balancesStore = useBalancesStore();
  // This won't update when store changes!
  return <div>{/* render account */}</div>;
};
```

### 2. **Store Actions**

```tsx
// ✅ Good: Async actions with proper error handling
async loadBalances() {
  this.loading = true;
  this.error = null;

  try {
    const data = await this.service.getBalances();
    runInAction(() => {
      this.balances = data;
      this.loading = false;
    });
  } catch (error) {
    runInAction(() => {
      this.error = error;
      this.loading = false;
    });
  }
}

// ❌ Avoid: Synchronous mutations of async results
async loadBalances() {
  const data = await this.service.getBalances();
  this.balances = data; // Might not be observed properly
}
```

### 3. **Computed Values**

```tsx
// ✅ Good: Efficient computed values
get sortedBalances() {
  return [...this.balances].sort((a, b) => a.amount - b.amount);
}

// ❌ Avoid: Recomputing on every access
getSortedBalances() {
  return [...this.balances].sort((a, b) => a.amount - b.amount);
}
```

## Migration Guide

### From Zustand

- Replace `useStore` hooks with `observer` + store hooks
- Move state logic from components to store classes
- Replace manual subscriptions with automatic reactivity

### From TanStack Query

- Move query logic to service methods
- Replace query states with store loading/error states
- Use store actions instead of mutations

## Development Workflow

1. **Add New Feature**:

   ```bash
   # 1. Add service method (if needed)
   # 2. Add store action
   # 3. Add computed value (if needed)
   # 4. Update component with observer
   ```

2. **Debug State**:

   ```tsx
   // Use MobX DevTools for runtime inspection
   import { configure } from 'mobx';

   configure({
     enforceActions: 'always',
     computedRequiresReaction: true,
     reactionRequiresObservable: true,
     observableRequiresReaction: true,
     disableErrorBoundaries: true,
   });
   ```

## Testing

```tsx
// Unit test example
describe('BalancesStore', () => {
  let store: BalancesStore;
  let mockService: jest.Mocked<PenumbraService>;

  beforeEach(() => {
    mockService = createMockService();
    store = new BalancesStore(createMockRootStore(mockService));
  });

  it('loads balances', async () => {
    mockService.getBalancesStream.mockReturnValue(mockBalances);

    await store.loadBalances();

    expect(store.balances).toEqual(mockBalances);
    expect(store.loading).toBe(false);
  });
});
```

This architecture provides a solid foundation for the minifront-v2 application with excellent performance, maintainability, and developer experience.
