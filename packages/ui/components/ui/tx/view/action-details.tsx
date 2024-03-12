import { ReactNode } from 'react';

/**
 * Render key/value pairs inside a `<ViewBox />`.
 *
 * @example
 * ```tsx
 * <ActionDetails>
 *   <ActionDetails.Row label="Validator">
 *     <IdentityKeyComponent identityKey={identityKey} />
 *   </ActionDetails.Row>
 * </ActionDetails>
 * ```
 */
export const ActionDetails = ({ children }: { children: ReactNode }) => {
  return <div className='flex flex-col gap-2'>{children}</div>;
};

const Separator = () => (
  // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dotted border-light-brown' />
);

const ActionDetailsRow = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className='flex items-center justify-between'>
      <span className='break-keep'>{label}</span>

      <Separator />

      {children}
    </div>
  );
};

ActionDetails.Row = ActionDetailsRow;
