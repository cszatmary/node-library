import { Result, errors } from "./packages/node-stdlib/dist/deno/mod.ts";

const err = errors.errorString("oops");
const failure = Result.failure(err);
console.log(failure);
