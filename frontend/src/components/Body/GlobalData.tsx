import { formatAmount } from '@massalabs/react-ui-kit';
import { useReadGlobal } from '../../hooks/read-sc';

export function GlobalData() {
  const { bytePriceScan, bytePriceVerification } = useReadGlobal();

  let formattedBytePriceScan = '...';
  if (bytePriceScan !== undefined) {
    formattedBytePriceScan = formatAmount(
      bytePriceScan.toString(),
    ).amountFormattedFull;
  }

  let formattedBytePriceVerification = '...';
  if (bytePriceVerification !== undefined) {
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
