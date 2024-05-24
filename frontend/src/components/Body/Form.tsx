import { Button, Input } from '@massalabs/react-ui-kit';
import { useState } from 'react';

interface FormProps {
  handleSubmit: (scToInspect: string) => void;
}

export function Form(props: FormProps) {
  const { handleSubmit } = props;

  const [scToInspect, setScToInspect] = useState('');

  return (
    <div className="flex justify-between w-full items-stretch ">
      <div className="flex flex-col grow mr-4">
        <Input
          placeholder="Enter a smart contract address"
          value={scToInspect}
          onChange={(e) => setScToInspect(e.target.value)}
        />
      </div>
      <div>
        <Button onClick={() => handleSubmit(scToInspect)}>Validate</Button>
      </div>
    </div>
  );
}
