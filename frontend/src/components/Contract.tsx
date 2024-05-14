import { MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { useWriteSmartContract } from '../lib/ConnectMassaWallets/hooks/write-sc';
import { useAccountStore } from '../lib/ConnectMassaWallets/store';
import { useState } from 'react';
import { ContractStatus } from './ContractStatus';
import { GlobalData } from './GlobalData';
import { Form } from './Form';

export function Contract() {
  const { massaClient, chainId } = useAccountStore();
  const isMainnet = chainId === MAINNET_CHAIN_ID;

  const { isPending, opId } = useWriteSmartContract(massaClient, isMainnet);

  const [scToInspect, setScToInspect] = useState('');

  return (
    <div className="flex flex-col gap-6 border-2 rounded-lg p-10 mb-20">
      <GlobalData scToInspect={scToInspect} />
      <Form
        handleSubmit={setScToInspect}
        disabled={!massaClient || (isPending && !!opId)}
      />
      {scToInspect && <ContractStatus scToInspect={scToInspect} />}
    </div>
  );
}
