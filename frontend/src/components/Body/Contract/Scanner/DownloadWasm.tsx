import { Button, toast } from '@massalabs/react-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchFile } from '../../../../services/apiClient';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { useMemo } from 'react';

interface DownloadWasmProps {
  scToInspect: string;
  isPaidScan?: boolean;
}

export function DownloadWasm(props: DownloadWasmProps) {
  const { scToInspect, isPaidScan } = props;
  const [chainId] = useAccountStore((s) => [s.chainId]);

  const chainIdString = useMemo(
    () =>
      chainId ? chainId.toString() : import.meta.env.VITE_CHAIN_ID.toString(),
    [chainId],
  );

  const { refetch: startWasmDownload, isFetching: wasmIsFetching } =
    useQuery<Blob>({
      queryKey: [scToInspect, chainIdString],
      queryFn: async () => {
        const response = await fetchFile(scToInspect, 'wasm', chainIdString);
        return response;
      },
      enabled: false,
    });

  const handleDownloadWasm = () => {
    const toastId = toast.loading('Downloading wasm...', {
      duration: Infinity,
    });

    startWasmDownload().then(({ data }) => {
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scToInspect}.wasm`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.dismiss(toastId);
    });
  };

  return (
    <Button
      onClick={handleDownloadWasm}
      disabled={!isPaidScan || wasmIsFetching}
    >
      Download wasm
    </Button>
  );
}
