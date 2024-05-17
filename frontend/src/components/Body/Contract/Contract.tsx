import { useReadScanner } from '../../../hooks/read-sc';
import { Button } from '@massalabs/react-ui-kit';
import { useClient } from '../../../hooks/client';
import { Verifier } from './Verifier/Verifier';
import { Scanner } from './Scanner/Scanner';

interface ContractProps {
  scToInspect: string;
}

export function Contract(props: ContractProps) {
  const { scToInspect } = props;
  const { client, isMainnet, contractAddressScanner, contractAddressVerifier } =
    useClient();

  const { scanPriceOf, isPaidScan, verificationPriceOf, isPaidVerification } =
    useReadScanner(scToInspect);

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
        />
        <Verifier
          verificationPriceOf={verificationPriceOf}
          isPaidVerification={isPaidVerification}
          client={client}
          isMainnet={isMainnet}
          contractAddressVerifier={contractAddressVerifier}
          scToInspect={scToInspect}
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
