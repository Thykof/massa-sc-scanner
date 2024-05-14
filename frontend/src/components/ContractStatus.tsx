import { MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { useAccountStore } from '../lib/ConnectMassaWallets/store';
import { useReadScanner } from '../hooks/read-sc';
import { Button, formatAmount } from '@massalabs/react-ui-kit';

interface ContractStatusProps {
  scToInspect: string;
}

export function ContractStatus(props: ContractStatusProps) {
  const { scToInspect } = props;
  const { massaClient, chainId } = useAccountStore();
  const isMainnet = chainId === MAINNET_CHAIN_ID;

  const { scanPriceOf, isPaidScan, verificationPriceOf, isPaidVerification } =
    useReadScanner(scToInspect, massaClient, isMainnet);

  let formattedScanPriceOf = '...';
  if (scanPriceOf) {
    formattedScanPriceOf = formatAmount(
      scanPriceOf.toString(),
    ).amountFormattedFull;
  }

  let formattedVerificationPriceOf = '...';
  if (verificationPriceOf) {
    formattedVerificationPriceOf = formatAmount(
      verificationPriceOf.toString(),
    ).amountFormattedFull;
  }

  const explorerURL = isMainnet
    ? `https://explorer.massa.net/mainnet/address/${scToInspect}`
    : `https://www.massexplo.io/address/${scToInspect}`;

  return (
    <>
      <div className="flex flex-col">
        <div className="p-5">
          <h2 className="mas-subtitle">Scanner</h2>
          <p>
            The price to scan this smart contract is {formattedScanPriceOf} MAS.
          </p>
          <p>
            {!isPaidScan
              ? 'You have to paid to scan this smart contract.'
              : 'Someone has paid to scan this smart contract.'}
          </p>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}} disabled={!isPaidScan}>
              Scan
            </Button>
            <Button onClick={() => {}} disabled={isPaidScan}>
              Pay to scan
            </Button>
          </div>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}} disabled={!isPaidScan}>
              Download wasm
            </Button>
            <Button onClick={() => {}} disabled={!isPaidScan}>
              Download wat
            </Button>
          </div>
        </div>
        <div className="p-5">
          <h2 className="mas-subtitle">Verifier</h2>
          <p>
            The price to verify this smart contract is{' '}
            {formattedVerificationPriceOf} MAS.
          </p>

          <p>
            {!isPaidVerification
              ? 'You have to paid to verify this smart contract.'
              : 'Someone has paid to verify this smart contract.'}
          </p>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}} disabled={!isPaidVerification}>
              Verify
            </Button>
            <Button onClick={() => {}} disabled={isPaidVerification}>
              Pay to verify
            </Button>
          </div>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}} disabled={!isPaidVerification}>
              Download ZIP
            </Button>
            <Button onClick={() => {}} disabled={!isPaidVerification}>
              See proof
            </Button>
          </div>
        </div>
        <div className="p-5">
          <h2 className="mas-subtitle">Inspect</h2>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}}>Read storage</Button>
            <Button
              onClick={() => {
                window.open(explorerURL);
              }}
            >
              Go to explorer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
