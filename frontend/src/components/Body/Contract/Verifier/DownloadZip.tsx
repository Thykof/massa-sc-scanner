import { Button, toast } from '@massalabs/react-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchFile } from '../../../../services/apiClient';

interface DownloadZipProps {
  scToInspect: string;
  isPaidVerification?: boolean;
}

export function DownloadZip(props: DownloadZipProps) {
  const { scToInspect, isPaidVerification } = props;

  const { refetch: startZipDownload, isFetching: zipIsFetching } =
    useQuery<Blob>({
      queryKey: [scToInspect],
      queryFn: async () => {
        const response = await fetchFile(scToInspect, 'zip');
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
