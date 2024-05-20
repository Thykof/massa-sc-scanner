import { ConnectMassaWallet } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { Toast } from '@massalabs/react-ui-kit';
import { FAQ } from './components/FAQ';
import { Body } from './components/Body/Body';

function App() {
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
          <h1 className="mas-title mb-2">Massa Smart contract Verifier</h1>
          <h2 className="mas-body">
            <i>
              Verify the source code of a smart contract and inspect its
              content.
            </i>
          </h2>
        </div>
        <div className="p-10 border-2 rounded-lg mb-4">
          <ConnectMassaWallet />
        </div>
        <Body />
        <div className="p-10 border-2 rounded-lg mb-4">
          <h1 className="mas-subtitle text-center">FAQ</h1>
          <FAQ />
        </div>
        <div>
          Github:{' '}
          <a
            className="underline cursor-pointer"
            href="https://github.com/Thykof/massa-sc-scanner"
          >
            https://github.com/Thykof/massa-sc-scanner
          </a>
          <br />
          Join Dusa:{' '}
          <a
            className="underline cursor-pointer"
            href="https://app.dusa.io/trade?ref=qmf57z"
          >
            https://app.dusa.io/trade?ref=qmf57z
          </a>
          <br />
          Delegated stacking:{' '}
          <a
            className="underline cursor-pointer"
            href="https://massa-blast.net"
          >
            https://massa-blast.net
          </a>
          <br />
          Mainnet faucet?{' '}
          <a
            className="underline cursor-pointer"
            href="https://fauxceeet.netlify.app"
          >
            https://fauxceeet.netlify.app
          </a>
        </div>
      </div>
      <div className="theme-dark">
        <Toast />
      </div>
    </div>
  );
}

export default App;
