import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ValueViewComponent } from '../value';
import { ArrowRight } from 'lucide-react';

export const Outputs = ({ output1, output2 }: { output1?: NoteView; output2?: NoteView }) => {
  if (!output1?.value || !output2?.value) return null;

  return (
    <div className='flex items-center gap-2'>
      <ValueViewComponent view={output1.value} />

      <ArrowRight />

      <ValueViewComponent view={output2.value} />
    </div>
  );
};
