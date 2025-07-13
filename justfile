dev:
    deno fmt
    deno lint
    deno check .

bundle:
    deno run -A scripts/bundle.ts

assert_unchanged:
    #!/bin/bash -ex
    [[ -z "$(git status -s)" ]] # https://stackoverflow.com/a/9393642

ci:
    just dev
    just bundle
    just assert_unchanged
