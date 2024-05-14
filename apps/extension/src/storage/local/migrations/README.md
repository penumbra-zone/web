# Migrations

The extension will migrate storage from an onInstalled handler that detects a
details.reason of 'UPDATE'

Migrations should always migrate from the immediate previous version to the new
version.

Migrations should be able to seamlessly carry an extension from 0 to your
current version.

## Migrations should be atomic

1. Get the entire storage into memory
2. Migrate your in-memory object
3. Set the entire storage

## Don't use @bufbuild packages in migrations

Avoid using pb message types in migrations. The types may change, and break your
old migrations. Manipulate the storage manually.

Write tests that confirm your migration.
