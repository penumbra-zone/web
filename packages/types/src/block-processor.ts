export interface BlockProcessorInterface {
  sync(): Promise<void>;
  stop(r?: string): void;
  timeChain(): Promise<void>;
}
