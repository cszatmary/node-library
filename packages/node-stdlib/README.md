# @cszatma/node-stdlib

An effort at creating a standard library for node. Reinvent the wheel (sort of).

## Why?

After spending a lot of time writing Go I have come to love it's rich standard library. Because it has such a robust standard library I've found I rarely need to reach for 3rd party libraries to do stuff. When I do need a third party library it is for something non-trival and contains a lot of functionality. Examples are `cobra`(https://github.com/spf13/cobra) for building CLIs or the [Docker Go SDK](https://github.com/moby/moby/tree/master/client). As a result the package explosion that is often common in the node ecosystem doesn't occur.

`node-stdlib` is my way of bringing this mentality to node. This package should have zero dependencies and provide as much functionality as possible. The goal is to add this to any other node project and be able to use it instead of installing a multitude of small packages.

This is also largly inspired by [deno](https://deno.land/) as it is copying a lot of what Go does great (in my opinion) and has its own standard library.
