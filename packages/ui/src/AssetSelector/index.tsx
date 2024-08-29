import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Dialog } from '../Dialog';
import { Text } from '../Text';
import styled from 'styled-components';
import { buttonBase } from '../utils/button';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { AssetIcon } from '../AssetIcon';
import { ConditionalWrap } from '../ConditionalWrap';
import { AssetSelectorDialogContent } from './AssetSelectorDialogContent';
import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import { isMetadata } from './helpers';
import { Icon } from '../Icon';
import { ChevronsUpDownIcon } from 'lucide-react';

const Button = styled(motion.button)<{ $density: Density }>`
  ${buttonBase}

  background-color: ${props => props.theme.color.other.tonalFill5};
  height: ${props => props.theme.spacing(props.$density === 'sparse' ? 12 : 8)};
  text-align: left;
  padding: 0 ${props => props.theme.spacing(props.$density === 'sparse' ? 3 : 2)};
  width: ${props => (props.$density === 'sparse' ? '100%' : 'max-content')};
`;

const Row = styled.div<{ $density: Density }>`
  display: flex;
  gap: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
  align-items: center;
`;

export interface AssetSelectorProps<ValueType extends (BalancesResponse | Metadata) | Metadata> {
  /**
   * The currently selected `Metadata` or `BalancesResponse`.
   */
  value?: ValueType;
  onChange: (value: ValueType) => void;
  /**
   * An array of `Metadata`s and possibly `BalancesResponse`s to render as
   * options. If `BalancesResponse`s are included in the `options` array, those
   * options will be rendered with the user's balance of them.
   */
  options: ValueType[];
  /** The title to show above the asset selector dialog when it opens. */
  dialogTitle: string;
}

/**
 * Allows users to choose an asset for e.g., the swap and send forms. Note that
 * the `options` prop can be an array of just `Metadata`s, or a mixed array of
 * both `Metadata`s and `BalancesResponse`s. The latter is useful for e.g.,
 * letting the user estimate a swap of an asset they don't hold.
 */
export const AssetSelector = <ValueType extends (BalancesResponse | Metadata) | Metadata>({
  value,
  onChange,
  options,
  dialogTitle,
}: AssetSelectorProps<ValueType>) => {
  const layoutId = useId();
  const density = useDensity();
  const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse.optional()(value);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newValue: ValueType) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Button $density={density} layoutId={layoutId} key={layoutId} onClick={() => setIsOpen(true)}>
        {value && (
          <Row $density={density}>
            <AssetIcon metadata={metadata} />
            <ConditionalWrap
              if={density === 'sparse'}
              then={children => <Text>{children}</Text>}
              else={children => <Text small>{children}</Text>}
            >
              {metadata?.symbol}
            </ConditionalWrap>
            <div className={'ml-auto'}>
              <Icon
                IconComponent={ChevronsUpDownIcon}
                size={'sm'}
                color={color => color.neutral.contrast}
              />
            </div>
          </Row>
        )}

        {!value && (
          <ConditionalWrap
            if={density === 'sparse'}
            then={children => <Text>{children}</Text>}
            else={children => <Text small>{children}</Text>}
          >
            Asset
          </ConditionalWrap>
        )}
      </Button>

      <AssetSelectorDialogContent
        title={dialogTitle}
        layoutId={layoutId}
        value={value}
        onChange={handleChange}
        options={options}
      />
    </Dialog>
  );
};
