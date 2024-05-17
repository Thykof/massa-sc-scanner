# MAssa SC Scanner

## Build

By default this will build all files in `assembly/contracts` directory.

```shell
npm run build
```

## Deployed contracts

Buildnet address for the scanner contract: AS1txUufiS7XkHE9caT5PEdDnaoiTzUgBbaDULKbLAKLX4gQeEc6.
Buildnet address for the verifier contract: AS1txUufiS7XkHE9caT5PEdDnaoiTzUgBbaDULKbLAKLX4gQeEc6.

(Scanner and Verifier are the same bytecode so the same contract in buildnet).

Mainnet address for the scanner contract: AS1299bGi75xZ9U2rXTFyX4JzqPekk7PvCFAZ8UvGMdkfgmyFu9pg.
Mainnet address for the verifier contract: AS12Yoh9A4BwDRqDCSw79JU7mkJCMsCVsDKRe2g5P66fc9NK72zDb.

## Unit tests

The test framework documentation is available here: [as-pect docs](https://as-pect.gitbook.io/as-pect)

```shell
npm run test
```

## Format code

```shell
npm run fmt
```
