import { KeyboardEventHandler, ReactNode, useState } from 'react';
import { IncognitoIcon } from '../../icons/incognito';
import { Separator } from '../../separator';
import { cn } from '../../../../lib/utils';

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

/**
 * Renders an accessible truncated text that can be expanded by clicking or pressing on it
 */
const ActionDetailsTruncatedText = ({ children }: { children?: ReactNode }) => {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = () => setIsTruncated(prev => !prev);
  const toggleTruncateEnter: KeyboardEventHandler<HTMLButtonElement> = event => {
    if (event.key === 'Enter') {
      toggleTruncate();
    }
  };

  return (
    <span
      className={cn('hover:underline', { truncate: isTruncated })}
      title={isTruncated && typeof children === 'string' ? children : undefined}
      role='button'
      tabIndex={0}
      onClick={toggleTruncate}
      onKeyDown={toggleTruncateEnter}
    >
      {children}
    </span>
  );
};

const ActionDetailsRow = ({
  label,
  children,
  isOpaque,
}: {
  label: string;
  children?: ReactNode;
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

      {children}
    </div>
  );
};

ActionDetails.Row = ActionDetailsRow;
ActionDetails.TruncatedText = ActionDetailsTruncatedText;
