import { ReactNode } from 'react';
import { IncognitoIcon } from '../../icons/incognito';
import { Separator } from '../../separator';

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

const ActionDetailsRow = ({
  label,
  children,
  truncate,
  isOpaque,
}: {
  label: string;
  children?: ReactNode;
  /**
   * If `children` is a string, passing `truncate` will automatically truncate
   * the text if it doesn't fit in a single line.
   */
  truncate?: boolean;
  /**
   * If set to true, add styles indicating that the row's data is _not_ visible.
   */
  isOpaque?: boolean;
}) => {
  return (
    <div className='flex items-center justify-between'>
      {isOpaque ? (
        <span className='flex items-center whitespace-nowrap text-gray-600'>
          <span className='mx-2'>
            <IncognitoIcon fill='#4b5563' />
          </span>
          <span>{label}</span>
        </span>
      ) : (
        <span className='whitespace-nowrap break-keep'>{label}</span>
      )}

      <Separator />

      {truncate ? <span className='truncate'>{children}</span> : children}
    </div>
  );
};

ActionDetails.Row = ActionDetailsRow;
