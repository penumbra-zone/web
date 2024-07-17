export enum PenumbraState {
  /* error is present */
  'Failed' = 'Failed',

  /* no action has been taken */
  'Present' = 'Present',

  /* approval request pending */
  'RequestPending' = 'RequestPending',
  /* request for approval satisfied */
  'Requested' = 'Requested',

  /* connection attempt pending */
  'ConnectPending' = 'ConnectPending',
  /* connection successful and active */
  'Connected' = 'Connected',

  /* disconnect was called to release approval */
  'Disconnected' = 'Disconnected',
}
