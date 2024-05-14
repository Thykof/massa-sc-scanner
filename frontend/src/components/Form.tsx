import { Button, Input } from '@massalabs/react-ui-kit';
import { useState } from 'react';

interface FormProps {
  handleSubmit: (scToInspect: string) => void;
  disabled: boolean;
}

export function Form(props: FormProps) {
  const { handleSubmit, disabled } = props;

  const [scToInspect, setScToInspect] = useState('');

  return (
    <div className="flex justify-between w-full items-stretch ">
      <div className="flex flex-col w-[70%] mr-4">
        <Input
          placeholder="Enter a smart contract address"
          value={scToInspect}
          onChange={(e) => setScToInspect(e.target.value)}
        />
      </div>
      <div>
        <Button onClick={() => handleSubmit(scToInspect)} disabled={disabled}>
          Validate
        </Button>
      </div>
    </div>
  );
}
