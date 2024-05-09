import { Args, MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { useWriteSmartContract } from './hooks/scanner';
import { useAccountStore } from './lib/ConnectMassaWallets/store';
import { ConnectMassaWallet } from './lib/ConnectMassaWallets/components/ConnectMassaWallet';
import { Button, Input, Toast } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { FAQ } from './FAQ';

const mainnetAddress = '';
const buildnetAddress = 'AS12duKkopjrnCG6L8cJkkh2Pax14aGATvihA9dqiz9d27EhhTXN2';

function App() {
  const { massaClient, chainId } = useAccountStore();
  const isMainnet = chainId === MAINNET_CHAIN_ID;

  const { callSmartContract, isPending, opId } = useWriteSmartContract(
    massaClient,
    isMainnet,
  );
  const contractAddress = isMainnet ? mainnetAddress : buildnetAddress;

  const [targetAddress, setTargetAddress] = useState('');

  const handleSubmit = () => {
    callSmartContract(
      'bytecodeOf',
      contractAddress,
      new Args().addString(targetAddress).serialize(),
      {
        pending: 'Pending...',
        success: 'Success :)',
        error: 'Failed :(',
      },
    )
      .then((bytecode: Uint8Array) => {
        console.log(bytecode.length);
      })
      .catch((e: Error) => {
        console.error(e);
      });
  };

  return (
    <div className="w-full">
      <div className="p-10 md:max-w-4xl m-auto">
        <div className="flex justify-center items-center mb-4">
          <img
            width="400"
            src="massa-sc-scanner.png"
            alt="massa-sc-scanner logo"
          />
        </div>
        <div className="text-center mb-5">
          <h1 className="mas-title mb-2">Massa Smart contract Scanner</h1>
          <h2 className="mas-body">
            <i>Explore the content of a smart contract.</i>
          </h2>
        </div>
        <div className="p-10 border-2 rounded-lg mb-4">
          <ConnectMassaWallet />
        </div>
        <div className="flex justify-between w-full items-stretch mb-20">
          <div className="flex flex-col w-[70%] mr-4">
            <Input
              placeholder="Enter a smart contract address"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
            />
          </div>
          <div className="border-2 rounded-lg">
            <Button
              onClick={handleSubmit}
              disabled={
                targetAddress === '' || !massaClient || (isPending && !!opId)
              }
            >
              Explore this contract
            </Button>
          </div>
        </div>
        <div className="p-10 border-2 rounded-lg mb-4">
          <h1 className="mas-subtitle text-center">FAQ</h1>
          <FAQ />
        </div>
        <div>
          Github:{' '}
          <a href="https://github.com/Thykof/massa-sc-scanner">
            https://github.com/Thykof/massa-sc-scanner
          </a>
          <br />
          Join Dusa:{' '}
          <a href="https://app.dusa.io/trade?ref=qmf57z">
            https://app.dusa.io/trade?ref=qmf57z
          </a>
          <br />
          Delegated stacking:{' '}
          <a href="https://massa-blast.net">https://massa-blast.net</a>
        </div>
      </div>
      <div className="theme-dark">
        <Toast />
      </div>
    </div>
  );
}

export default App;
