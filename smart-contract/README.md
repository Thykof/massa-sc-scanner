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

Mainnet address for the scanner contract: AS121YPZJSZAFy4kss95jez1WRF16o4PRq8GE8HyvpHaQYt2spDE2.
Mainnet address for the verifier contract: AS126zKYJS3bH5bkoVSvR6y534iDiZYuUB2R1ZBmB1q2yi8u5GsLC.

## Unit tests

The test framework documentation is available here: [as-pect docs](https://as-pect.gitbook.io/as-pect)

```shell
npm run test
```

## Format code

```shell
npm run fmt
```
