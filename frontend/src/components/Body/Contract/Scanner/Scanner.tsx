import { Args, Client } from '@massalabs/massa-web3';
import { Button, formatAmount } from '@massalabs/react-ui-kit';
import { useWriteSmartContract } from '@massalabs/react-ui-kit/src/lib/massa-react/hooks/useWriteSmartContract';

interface ScannerProps {
  client: Client | undefined;
  isMainnet: boolean;
  scanPriceOf?: bigint;
  isPaidScan?: boolean;
  contractAddressScanner: string;
  scToInspect: string;
}

export function Scanner(props: ScannerProps) {
  const {
    client,
    isMainnet,
    scanPriceOf,
    isPaidScan,
    contractAddressScanner,
    scToInspect,
  } = props;

  const { callSmartContract } = useWriteSmartContract(client, isMainnet);

  const handlePayToScan = () => {
    if (!scanPriceOf) {
      console.error('scanPriceOf is not defined');
      return;
    }
    if (!scToInspect) {
      console.error('scToInspect is not defined');
      return;
    }
    callSmartContract(
      'pay',
      contractAddressScanner,
      new Args().addString(scToInspect).serialize(),
      {
        pending: 'Paying to scan...',
        success: 'Paid to scan',
        error: 'Error paying to scan',
      },
      scanPriceOf,
    );
  };

  let formattedScanPriceOf = '...';
  if (scanPriceOf) {
    formattedScanPriceOf = formatAmount(
      scanPriceOf.toString(),
    ).amountFormattedFull;
  }

  return (
    <div className="p-5">
      <h2 className="mas-subtitle">Scanner</h2>
      <p>Scanner is coming soon</p>

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
          Scan (soon)
        </Button>
        <Button onClick={handlePayToScan} disabled={isPaidScan}>
          Pay to scan
        </Button>
      </div>
      <div className="flex flex-row items-center gap-4 mt-2 mb-4">
        <Button onClick={() => {}} disabled={!isPaidScan || true}>
          Download wasm (soon)
        </Button>
        <Button onClick={() => {}} disabled={!isPaidScan || true}>
          Download wat (soon)
        </Button>
      </div>
    </div>
  );
}
