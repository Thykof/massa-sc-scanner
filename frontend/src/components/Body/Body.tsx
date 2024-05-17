import { useState } from 'react';
import { Contract } from './Contract/Contract';
import { GlobalData } from './GlobalData';
import { Form } from './Form';

export function Body() {
  const [scToInspect, setScToInspect] = useState('');

  return (
    <div className="flex flex-col gap-6 border-2 rounded-lg p-10 mb-20">
      <GlobalData scToInspect={scToInspect} />
      <Form handleSubmit={setScToInspect} disabled={false} />
      {scToInspect && <Contract scToInspect={scToInspect} />}
    </div>
  );
}
