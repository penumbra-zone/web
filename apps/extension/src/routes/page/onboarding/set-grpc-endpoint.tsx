import { Card, CardDescription, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { ServicesMessage } from '@penumbra-zone/types/services';
import { GrpcEndpointForm } from '../../../shared/components/grpc-endpoint-form';

export const SetGrpcEndpoint = () => {
  const navigate = usePageNav();

  const onSuccess = (): void => {
    void chrome.runtime.sendMessage(ServicesMessage.OnboardComplete);
    navigate(PagePath.ONBOARDING_SUCCESS);
  };

  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle>Select your preferred RPC endpoint</CardTitle>
          <CardDescription>
            The requests you make may reveal your intentions about transactions you wish to make, so
            select an RPC node that you trust. If you&apos;re unsure which one to choose, leave this
            option set to the default.
          </CardDescription>
        </CardHeader>

        <div className='mt-6'>
          <GrpcEndpointForm submitButtonLabel='Next' onSuccess={onSuccess} />
        </div>
      </Card>
    </FadeTransition>
  );
};
