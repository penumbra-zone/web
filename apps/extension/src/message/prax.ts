export enum Prax {
  InitConnection = 'InitConnection',
  RequestConnection = 'RequestConnection',
  ApprovedConnection = 'ApprovedConnection',
  DeniedConnection = 'DeniedConnection',
}

export type PraxResponder<T extends Prax> = T extends Prax.RequestConnection
  ? (r?: Prax.ApprovedConnection | Prax.DeniedConnection) => void
  : never;
