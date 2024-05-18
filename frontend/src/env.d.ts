/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SC_ADDRESS_SCANNER_BUILDNET: string;
  readonly VITE_SC_ADDRESS_SCANNER_MAINNET: string;
  readonly VITE_SC_ADDRESS_VERIFIER_BUILDNET: string;
  readonly VITE_SC_ADDRESS_VERIFIER_MAINNET: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
