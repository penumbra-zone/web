import { PartialMessage } from '@bufbuild/protobuf';
import {
  AuthorizeAndBuildRequest,
  AuthorizeAndBuildResponse,
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PromiseClient } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';

export const buildTransaction = async (
  req: PartialMessage<AuthorizeAndBuildRequest> | PartialMessage<WitnessAndBuildRequest>,
  // TODO: investigate @connectrpc/connect versions (1.6.1 vs 1.4.0)
  buildFn: PromiseClient<typeof ViewService>['authorizeAndBuild' | 'witnessAndBuild'],
  onStatusUpdate: (
    status?: (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'],
  ) => void,
) => {
  // Setting timeout for 10mins given slower machines can take time to build
  for await (const { status } of buildFn(req, { timeoutMs: 600_000 })) {
    onStatusUpdate(status);

    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
        return status.value.transaction!;
      default:
        console.warn(`unknown ${buildFn.name} status`, status);
    }
  }
  throw new Error('did not build transaction');
};
