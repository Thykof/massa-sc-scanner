import { useState } from 'react';
import { Contract } from './Contract/Contract';
import { GlobalData } from './GlobalData';
import { Form } from './Form';
import { useReadScanner } from '../../hooks/read-sc';

export function Body() {
  const [scToInspect, setScToInspect] = useState('');

  const {
    scanPriceOf,
    isPaidScan,
    verificationPriceOf,
    isPaidVerification,
    error,
  } = useReadScanner(scToInspect);

  return (
    <div className="flex flex-col gap-6 border-2 rounded-lg p-10 mb-20">
      <GlobalData />
      <Form handleSubmit={setScToInspect} disabled={false} />
      {error && (
        <p className="text-red-500">
          This smart contract doesn't exist on the selected network.
        </p>
      )}
      {scToInspect && (
        <Contract
          isPaidScan={isPaidScan}
          scanPriceOf={scanPriceOf}
          verificationPriceOf={verificationPriceOf}
          isPaidVerification={isPaidVerification}
          scToInspect={scToInspect}
        />
      )}
    </div>
  );
}
