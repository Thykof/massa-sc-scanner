import { formatAmount } from '@massalabs/react-ui-kit';
import { useReadScanner } from '../../hooks/read-sc';

interface GlobalDataProps {
  scToInspect: string;
}

export function GlobalData(props: GlobalDataProps) {
  const { scToInspect } = props;

  const { bytePriceScan, bytePriceVerification } = useReadScanner(scToInspect);

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
