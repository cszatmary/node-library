# Styleguide

This document describes the styleguide conventions of the `node-library` repo.

This is heavily inspired by the [deno style guide](https://deno.land/std/style_guide.md) and a lot of the rules are taken from there.

## Avoid adding packages

Avoid adding new packages whenever possible. Prevent the package explosion that often occurs in the node ecosystem. Packages should follow the deep module philosophy. Have a simple interface and offer lots of functionality.

## Avoid creating new repos

If a new package must be created add it to this repo instead of separate repos. This allows tooling and infrastructure to be shared across packages. It also keeps everything nicely co-located.

## Use TypeScript

This repo uses TypeScript. Always use TypeScript unless absolutely necessary (ex: eslint config).

## Keep configurations simple

Stick to default or recommended configurations for tools as much as possible.

For shared eslint config: keep it simple. Only add/modify rules when necessary.

## `node-stdlib` should have zero dependencies

`node-stdlib` is intended to have baseline functionality that all node/TypeScript programs can rely on. Any additional functionality needed to implement something should also be implemented.

## Minimize dependencies

Avoid adding package dependencies unless absolutely necessary.

## Separate source code and tests

Source code goes in `src` and tests go in `tests`. This is to make it easier to exclude tests from the outputted JavaScript source.

## Organize code into modules

A module is directory containing a collection of TypeScript files. Each module should serve a single clear purpose. If it serves multiple purposes it should be broken up into separate modules for each purpose.

## Modules should have a `mod.ts` file

This will serve as the module's entrypoint and should re-export all exports from each TypeScript file in the module.

## Packages should have a root `index.ts`

Every package should have a `src/index.ts` file. This is the main entrypoint for the package.

This file should re-export every module with that module's name using the `export * as` syntax.

## Do not use `index.ts` files

No `index.ts` files should exist except for `src/index.ts`. Instead `mod.ts` should be used as described above. This is to avoid the magicalness of `index.ts`.

## Use `error` and `Result` instead of JavaScript's `Error`

`Error` implies `throw` and `try/catch` which should be avoided as it results in convoluted code.

Errors should be treated as values and returned from functions just like any other value. Use `Result` when dealing with success or failure cases. Use functions provided by the `errors` module such as `wrap` to provide context to errors.

This is inline with Go's beliefs on exceptions and error handling: https://golang.org/doc/faq#exceptions.
