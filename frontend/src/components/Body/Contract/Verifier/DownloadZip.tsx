import { Button, toast } from '@massalabs/react-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchFile } from '../../../../services/apiClient';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { useMemo } from 'react';

interface DownloadZipProps {
  scToInspect: string;
  isPaidVerification?: boolean;
}

export function DownloadZip(props: DownloadZipProps) {
  const { scToInspect, isPaidVerification } = props;
  const [chainId] = useAccountStore((s) => [s.chainId]);

  const chainIdString = useMemo(
    () => (chainId ? chainId.toString() : MAINNET_CHAIN_ID.toString()),
    [chainId],
  );

  const { refetch: startZipDownload, isFetching: zipIsFetching } =
    useQuery<Blob>({
      queryKey: [scToInspect, chainIdString],
      queryFn: async () => {
        const response = await fetchFile(scToInspect, 'zip', chainIdString);
        return response;
      },
      enabled: false,
    });

  const handleDownload = () => {
    const toastId = toast.loading('Downloading zip...', {
      duration: Infinity,
    });
    startZipDownload().then(({ data }) => {
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `source-code-verified-${scToInspect}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.dismiss(toastId);
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={!isPaidVerification || zipIsFetching}
    >
      Download ZIP
    </Button>
  );
}
