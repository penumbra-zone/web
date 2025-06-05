import React from 'react';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { CopyToClipboardButton } from '@penumbra-zone/ui/CopyToClipboardButton';
import { Text, TextProps } from '@penumbra-zone/ui/Text';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';

export interface DetailRowProps {
  label: string;
  value?: React.ReactNode;
  /** If true, show copy button for string/number values that are not URLs. For URLs, a link icon is shown. */
  showCopy?: boolean;
  /** If true, show a link icon for URLs. */
  showLink?: boolean;
  /** If false, the string/number value will not be truncated and will be allowed to wrap. Defaults to true. */
  truncateValue?: boolean;
}

const isUrl = (value: unknown): value is string =>
  typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  showCopy,
  showLink,
  truncateValue,
}) => {
  if (value == null) {
    return null;
  }

  const getRawTextForCopy = (node: React.ReactNode): string => {
    if (React.isValidElement(node) && node.type === AddressViewComponent) {
      const props = node.props as { view?: AddressView };
      const addressView = props.view;
      if (addressView?.addressView.case === 'decoded') {
        return addressView.addressView.value.address?.altBech32m ?? '';
      } else if (addressView?.addressView.case === 'opaque') {
        return addressView.addressView.value.address?.altBech32m ?? '';
      }
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    return '';
  };

  const renderValue = () => {
    if (isUrl(value)) {
      return (
        <div className='max-w-[250px] font-mono text-sm'>
          <a href={value} target='_blank' rel='noopener noreferrer' className='hover:underline'>
            <Text truncate variant='smallTechnical' color='text.secondary'>
              {value}
            </Text>
          </a>
        </div>
      );
    } else if (typeof value === 'string' || typeof value === 'number') {
      const shouldTruncate = truncateValue === undefined || truncateValue;
      return (
        <div
          className={`flex ${shouldTruncate ? 'items-center' : 'items-start'} gap-1 font-mono text-sm ${shouldTruncate ? 'max-w-[250px]' : ''}`}
        >
          <Text
            truncate={shouldTruncate}
            variant='smallTechnical'
            color='text.secondary'
            whitespace={shouldTruncate ? undefined : 'pre-wrap'}
          >
            {String(value)}
          </Text>
        </div>
      );
    }
    return <div className='flex items-center gap-1 text-right text-sm'>{value}</div>;
  };

  const rawValueToCopy = getRawTextForCopy(value);

  const labelTextProps: TextProps = { color: 'text.secondary', variant: 'smallTechnical' };

  return (
    <div className='flex items-start justify-between text-sm'>
      <div className='pt-0.5'>
        <Text as='span' {...labelTextProps}>
          {label}
        </Text>
      </div>
      <div className='mx-2 grow border-b border-dashed border-other-tonalStroke pt-3'></div>
      <div className='flex items-center gap-1'>
        {renderValue()}
        {isUrl(value) && (showLink === undefined || showLink) && (
          <a href={value} target='_blank' rel='noopener noreferrer'>
            <Button icon={LinkIcon} iconOnly='adornment' density='compact'>
              Open link
            </Button>
          </a>
        )}
        {showCopy && !isUrl(value) && rawValueToCopy && (
          <CopyToClipboardButton text={rawValueToCopy} variant={'slim'} />
        )}
        {React.isValidElement(value) && value.type === AddressViewComponent && rawValueToCopy && (
          <CopyToClipboardButton text={rawValueToCopy} variant={'slim'} />
        )}
      </div>
    </div>
  );
};
