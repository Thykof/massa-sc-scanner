import { MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { useAccountStore } from '../lib/ConnectMassaWallets/store';
import { useReadScanner } from '../hooks/read-sc';
import { formatAmount } from '@massalabs/react-ui-kit';

interface GlobalDataProps {
  scToInspect: string;
}

export function GlobalData(props: GlobalDataProps) {
  const { scToInspect } = props;
  const { massaClient, chainId } = useAccountStore();
  const isMainnet = chainId === MAINNET_CHAIN_ID;

  const { bytePriceScan, bytePriceVerification } = useReadScanner(
    scToInspect,
    massaClient,
    isMainnet,
  );

  let formattedBytePriceScan = '...';
  if (bytePriceScan) {
    formattedBytePriceScan = formatAmount(
      bytePriceScan.toString(),
    ).amountFormattedFull;
  }

  let formattedBytePriceVerification = '...';
  if (bytePriceVerification) {
    formattedBytePriceVerification = formatAmount(
      bytePriceVerification.toString(),
    ).amountFormattedFull;
  }

  return (
    <>
      <div className="flex flex-col">
        <p>
          Price per byte to scan a smart contract: {formattedBytePriceScan} MAS.
        </p>
        <p>
          Price per byte to verify a smart contract:{' '}
          {formattedBytePriceVerification} MAS.
        </p>
      </div>
    </>
  );
}
