# Massa SC Scanner

<https://massa-sc-scanner.netlify.app>

## Description

This is a simple smart contract scanner for the Massa Blockchain.

## Usage

User can scan a smart contract by providing the smart contract address and paid the fees.

The fees are calculated by the following formula: size of the bytecode \* price per byte.

The owner of the smart contract can change the price per byte.

## Roadmap

- download the wasm bytecode
- download the wasm text file (wat)
- see the imported ABI functions
- see the export smart contract function
- see the source map file name
- see the smart contract storage
- readonly the smart contract exported function

Later, I will develop a service to verify the smart contract source code.

## FAQ

See the FAQ section in the webpage.

## License

This project is licensed under the Business Source License 1.1 License - see the [LICENSE.md](LICENSE.md) file for details

This is not a free license. You can't use this in production (mainnet) without a commercial license.
