setup:
    npm ci

dev:
    npm run format:check
    npm run lint
    npm run typecheck
    npm run test

update:
    npm update

bundle:
    npm run build

assert_unchanged:
    npm run assert:unchanged

ci:
    npm run ci
