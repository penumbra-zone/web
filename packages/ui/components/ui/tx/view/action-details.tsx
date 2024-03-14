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
export const ActionDetails = ({ children, label }: { children: ReactNode; label?: string }) => {
  return (
    <div className='flex flex-col gap-2'>
      {!!label && <div className='font-bold'>{label}</div>}

      {children}
    </div>
  );
};

const Separator = () => (
  // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dotted border-light-brown' />
);

const ActionDetailsRow = ({
  label,
  children,
  truncate,
}: {
  label: string;
  children: ReactNode;
  /**
   * If `children` is a string, passing `truncate` will automatically truncate
   * the text if it doesn't fit in a single line.
   */
  truncate?: boolean;
}) => {
  return (
    <div className='flex items-center justify-between'>
      <span className='whitespace-nowrap break-keep'>{label}</span>

      <Separator />

      {truncate ? <span className='truncate'>{children}</span> : children}
    </div>
  );
};

ActionDetails.Row = ActionDetailsRow;
