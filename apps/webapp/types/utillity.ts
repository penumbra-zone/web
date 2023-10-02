export interface Validation {
  checkFn: (txt: string) => boolean;
  type: 'warn' | 'error'; // corresponds to red or yellow
  error: string;
}
