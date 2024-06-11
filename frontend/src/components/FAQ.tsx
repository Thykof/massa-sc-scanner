export function FAQ() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Scanner</h1>
      <div className="mb-4">
        <strong>How does it work?</strong>
        <p>
          The scanner smart contract is able to read the bytecode of another
          smart contract. Then we can extract useful information from the
          bytecode.
        </p>
      </div>
      <div className="mb-4">
        <strong>How much does it cost?</strong>
        <p>
          The cost is calculated by multiplying the size of the bytecode and the
          price per byte. When a user pay to scan a smart contract, anyone can
          request a scan of this smart contract. Note that the price include the
          storage cost (around 0.0062 MAS).
        </p>
      </div>
      <div className="mb-4">
        <strong>How to use it on Massa Buildnet?</strong>
        <p>
          To use the scanner and the verifier on the Buildnet, simply connect
          your wallet with Massa Wallet and Massa Station on the Buildnet.
        </p>
      </div>
      <div className="mb-4">
        <strong>What will be the next features?</strong>
        <div>
          The next features will allow you to:
          <ul>
            <li>- see the smart contract storage,</li>
            <li>- readonly the smart contract exported function.</li>
          </ul>
        </div>
      </div>
      <h1 className="text-2xl font-bold">Verifier</h1>
      <div className="mb-4">
        <strong>How does it work?</strong>
        <p>
          The verifier smart contract is also able to read the bytecode of
          another smart contract. You can upload a zip file of source code and
          the verifier will compare the deployed smart contract with the source
          code. The zip archive must contain the package.json file at the root.
          Then the server will extract the zip and compile the source code. The
          verifier will compare the deployed smart contract with the compiled
          wasm bytecode. Everything is store in a database for future reference.
        </p>
      </div>
      <div className="mb-4">
        <strong>How much does it cost?</strong>
        <p>
          The cost is calculated by multiplying the size of the bytecode and the
          price per byte. When a user pay to verify a smart contract, anyone can
          upload a source code zip file if the smart contract is not verified.
          Note that the price include the storage cost (around 0.0062 MAS).
        </p>
      </div>
      <div className="mb-4">
        <strong>What is the expected format of the zip file?</strong>
        <p>
          The zip file must contain the package.json file at the root. The npm
          dependencies must not have critical vulnerability. Check the
          vulnerabilities with the command:
        </p>
        <pre>npm audit</pre>
        <p>
          The zip archive must not contain the node_modules, .git and build
          folders. In addition, it must not contains the files: .env. It must
          contains the folder assembly and the file package.json.
        </p>
      </div>
      <div className="mb-4">
        <strong>How long is the verification?</strong>
        <p>
          The verification can take up to 3 or 4 minutes. The website will fetch
          the status every 5 seconds. If the verification is not completed after
          5 minutes, this is probably because the zip file format is invalid or
          does not correspond to the deployed smart contract.
        </p>
      </div>
      <div className="mb-4">
        <strong>How can I see the proof of the verification status?</strong>
        <p>
          To see the proof that the bytecode of a smart contract corresponds to
          the source code, you can download the zip file and the deployed
          bytecode and perform the commands:
        </p>
        <pre>npm install</pre>
        <pre>npm build</pre>
        <p>
          Then you can generate the sha1 of the wasm file and compare it with
          the sha1 of the deployed smart contract:
        </p>{' '}
        <pre>shasum build/*.wasm</pre>
      </div>
      <div className="mb-4">
        <strong>What will be the next features?</strong>
        <div>
          The next features will allow you to:
          <ul>
            <li>
              - provide a new source code zip file of a smart contract if the
              deployed smart contract has been updated,
            </li>
            <li>
              - only the address that paid will be able to upload the source
              code zip file,
            </li>
            <li>
              - the verification status will be updated regularly to monitor
              smart contract mutation (setBytecode ABI).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
