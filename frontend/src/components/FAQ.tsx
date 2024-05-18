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
          request a scan of this smart contract.
        </p>
      </div>
      <div className="mb-4">
        <strong>What is the development status?</strong>
        <p>
          This is a work in progress. The smart contract is ready for
          production, but the features to extract useful information from the
          bytecode are not ready yet. Your payment will be registered in the
          smart contract, so you can request the scan later (with no additional
          cost) when more information will be available.
        </p>
      </div>
      <div className="mb-4">
        <strong>What will be the next features?</strong>
        <div>
          The next features will allow you to:
          <ul>
            <li>- download the wasm bytecode,</li>
            <li>- download the wasm text file (wat),</li>
            <li>- see the imported ABI functions,</li>
            <li>- see the export smart contract function,</li>
            <li>- see the source map file name,</li>
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
        </p>
      </div>
      <div className="mb-4">
        <strong>How can I see the proof of the verification status?</strong>
        <p>
          To see the proof that the bytecode of a smart contract corresponds to
          the source code, you will soon be able to download the zip file and
          the deployed bytecode and perform the commands:
          <pre>npm install</pre>
          <pre>npm build</pre>
          Then you can generate the sha1 of the wasm file and compare it with
          the sha1 of the deployed smart contract:
          <pre>shasum build/*.wasm</pre>
        </p>
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
            <li>- download the source code of the smart contract,</li>
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
