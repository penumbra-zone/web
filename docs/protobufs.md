# Protobufs

### Validation

In protos, any field with a non-primitive type is optional. For example:

Given [the SpendableNoteRecord struct](https://github.com/penumbra-zone/penumbra/blob/39864c64fb7478ce255dd3e5a829c178933d06fb/crates/view/src/note_record.rs#L13-L24) and [protobuf definition](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.SpendableNoteRecord) here is the typescript that is generated:

```typescript
declare class SpendableNoteRecord extends Message<SpendableNoteRecord> {
  noteCommitment?: StateCommitment;
  note?: Note;
  addressIndex?: AddressIndex;
  nullifier?: Nullifier;
  heightCreated: bigint;
  heightSpent: bigint;
  position: bigint;
  source?: NoteSource;
}
```

It appears some fields that are required are listed as optional (e.g. noteCommitment) and others that are optional are listed as required (e.g. heightSpent).

In short, you cannot trust the presence or absence of ANY fields in protobufs. Protos don't acknowledge how the application intends to use them and consumers are responsible for field validation.

We do this via `Zod`. It's not everywhere, but hopefully it can be in most places! At runtime, we validate schemas using this library, forming the new, corrected type. [EXAMPLE](packages/wasm/src/keys.ts)
