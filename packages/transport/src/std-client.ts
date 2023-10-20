import {
  IncomingRequest,
  isServiceWorkerResponse,
  PenumbraError,
  PingMessage,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
} from 'penumbra-types';

interface RequestResolvers {
  resolve: (m: ServiceWorkerResponse<SwRequestMessage>) => void;
  reject: (e: PenumbraError) => void;
}

interface PendingRequests {
  sequence: number;
  requests: Map<number, RequestResolvers>;
}

// Consult `allowedDappMessages` in packages/types/src/std-route.ts
// Will be restricted to only those messages in that list.
export class PenumbraStdClient {
  private readonly transport: StdTransport = new StdTransport();

  async ping(arg: string) {
    const res = await this.transport.sendMessage<PingMessage>({ type: 'PING', arg });
    return res.ack;
  }
}

class StdTransport {
  private readonly pending: PendingRequests = { sequence: 0, requests: new Map() };

  constructor() {
    window.addEventListener('message', e => this.handleResponse(e));
  }

  async sendMessage<T extends SwRequestMessage>(
    penumbraSwReq: IncomingRequest<T>,
  ): Promise<T['response']> {
    const sequence = ++this.pending.sequence;
    const promiseResponse = new Promise<ServiceWorkerResponse<T>>((resolve, reject) => {
      this.pending.requests.set(sequence, { resolve, reject });
    });
    window.postMessage({
      sequence,
      penumbraSwReq,
    } satisfies ServiceWorkerRequest<T>);

    const res = await promiseResponse;
    if ('penumbraSwRes' in res) {
      return res.penumbraSwRes.data as T['response'];
    } else {
      throw new Error(res.penumbraSwError);
    }
  }

  private handleResponse(event: MessageEvent<unknown>) {
    if (event.source !== window || !isServiceWorkerResponse(event.data)) return;

    const { sequence } = event.data;

    if (this.pending.requests.has(sequence)) {
      const { resolve, reject } = this.pending.requests.get(sequence)!;

      if ('penumbraSwRes' in event.data) {
        this.pending.requests.delete(sequence) && resolve(event.data);
      } else {
        this.pending.requests.delete(sequence) && reject(event.data);
      }
    } else {
      throw new Error(`Sequence ${sequence}, not in pending requests record`);
    }
  }
}
