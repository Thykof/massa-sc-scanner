import { Button } from '@massalabs/react-ui-kit';
import { useClient } from '../../../hooks/client';
import { Verifier } from './Verifier/Verifier';
import { Scanner } from './Scanner/Scanner';

interface ContractProps {
  scanPriceOf?: bigint;
  isPaidScan?: boolean;
  verificationPriceOf?: bigint;
  isPaidVerification?: boolean;
  scToInspect: string;
  refresh: () => void;
}

export function Contract(props: ContractProps) {
  const {
    scanPriceOf,
    isPaidScan,
    verificationPriceOf,
    isPaidVerification,
    scToInspect,
    refresh
  } = props;
  const { client, isMainnet, contractAddressScanner, contractAddressVerifier } =
    useClient();

  const explorerURL = isMainnet
    ? `https://explorer.massa.net/mainnet/address/${scToInspect}`
    : `https://www.massexplo.io/address/${scToInspect}`;

  return (
    <>
      <div className="flex flex-col">
        <Scanner
          scanPriceOf={scanPriceOf}
          isPaidScan={isPaidScan}
          client={client}
          isMainnet={isMainnet}
          contractAddressScanner={contractAddressScanner}
          scToInspect={scToInspect}
          refresh={refresh}
        />
        <Verifier
          verificationPriceOf={verificationPriceOf}
          isPaidVerification={isPaidVerification}
          client={client}
          isMainnet={isMainnet}
          contractAddressVerifier={contractAddressVerifier}
          scToInspect={scToInspect}
          refresh={refresh}
        />
        <div className="p-5">
          <h2 className="mas-subtitle">Inspect</h2>
          <div className="flex flex-row items-center gap-4 mt-2 mb-4">
            <Button onClick={() => {}} disabled={true}>
              Read storage (soon)
            </Button>
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
