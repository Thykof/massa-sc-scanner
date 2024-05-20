import { Button, toast } from '@massalabs/react-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchFile } from '../../../../services/apiClient';

interface DownloadWatProps {
  scToInspect: string;
  isPaidScan?: boolean;
}

export function DownloadWat(props: DownloadWatProps) {
  const { scToInspect, isPaidScan } = props;

  const { refetch: startWatDownload, isFetching: watIsFetching } =
    useQuery<Blob>({
      queryKey: [scToInspect],
      queryFn: async () => {
        const response = await fetchFile(scToInspect, 'wat');
        return response;
      },
      enabled: false,
    });

  const handleDownloadWat = () => {
    const toastId = toast.loading('Downloading wat...', {
      duration: Infinity,
    });
    startWatDownload().then(({ data }) => {
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scToInspect}.wat`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.dismiss(toastId);
    });
  };
  return (
    <Button onClick={handleDownloadWat} disabled={!isPaidScan || watIsFetching}>
      Download wat
    </Button>
  );
}
