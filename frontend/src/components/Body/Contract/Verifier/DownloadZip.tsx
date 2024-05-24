import { useMemo } from 'react';
import { Button, toast } from '@massalabs/react-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchFile } from '../../../../services/apiClient';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';

interface DownloadZipProps {
  scToInspect: string;
  isPaidVerification?: boolean;
  isVerified?: boolean;
}

export function DownloadZip(props: DownloadZipProps) {
  const { scToInspect, isPaidVerification, isVerified } = props;
  const [chainId] = useAccountStore((s) => [s.chainId]);

  const chainIdString = useMemo(
    () =>
      chainId ? chainId.toString() : import.meta.env.VITE_CHAIN_ID.toString(),
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
      disabled={!isPaidVerification || zipIsFetching || !isVerified}
    >
      Download ZIP
    </Button>
  );
}
