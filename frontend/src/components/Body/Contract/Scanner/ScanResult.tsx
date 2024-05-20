import { InspectData } from './Scanner';

interface ScannerProps {
  dataInspect?: InspectData;
}

export function ScanResult(props: ScannerProps) {
  const { dataInspect } = props;

  if (!dataInspect) {
    return null;
  }

  return <pre>{JSON.stringify(dataInspect, undefined, 2)}</pre>;
}
