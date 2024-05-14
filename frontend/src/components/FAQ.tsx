export function FAQ() {
  return (
    <div className="w-full">
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
            <li>- readonly the smart contract exported function,</li>
            <li>
              - provide the source code of a smart contract to verify that the
              deployed smart contract is the same as the source code.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
