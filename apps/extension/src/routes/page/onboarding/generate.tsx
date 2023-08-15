import { Card, CardContent, CardHeader, CardTitle } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '@ui/components/ui/back-icon';

export const GenerateSeedPhrase = () => {
  const navigate = useNavigate();

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[650px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle>New Recovery Phrase</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'></CardContent>
      </Card>
    </FadeTransition>
  );
};
