import { ForwardedRef, forwardRef, MouseEventHandler } from 'react';
import styled, { css } from 'styled-components';
import { ChevronsUpDownIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { ActionType, getOutlineColorByActionType } from '../utils/ActionType.ts';
import { Density } from '../types/Density.ts';
import { useDensity } from '../hooks/useDensity';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { AssetIcon } from '../AssetIcon';
import { isMetadata } from './utils/helpers.ts';
import { Dialog } from '../Dialog/index.tsx';

const SparseButton = css`
  height: ${props => props.theme.spacing(12)};
  padding: 0 ${props => props.theme.spacing(3)};
`;

const CompactButton = css`
  height: ${props => props.theme.spacing(8)};
  padding: 0 ${props => props.theme.spacing(2)};
`;

const Trigger = styled(motion.button)<{ $density: Density; $actionType: ActionType }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing(1)};
  min-width: ${props => props.theme.spacing(20)};
  border-radius: ${props => props.theme.borderRadius.none};
  background: ${props => props.theme.color.other.tonalFill5};
  transition:
    background 0.15s,
    outline 0.15s;

  ${props => (props.$density === 'sparse' ? SparseButton : CompactButton)};

  &:hover {
    background-color: ${props => props.theme.color.action.hoverOverlay};
  }

  &:focus {
    color: ${props => props.theme.color.text.secondary};
    background: ${props => props.theme.color.other.tonalFill5};
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &:disabled {
    background: linear-gradient(
        0deg,
        ${props => props.theme.color.action.disabledOverlay} 0%,
        ${props => props.theme.color.action.disabledOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill10};
  }
`;

const Value = styled.div<{ $density: Density; $actionType: ActionType }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(props.$density === 'sparse' ? 2 : 1)};
`;

const IconAdornment = styled.i<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing(1)};
  width: ${props => props.theme.spacing(6)};
  height: ${props => props.theme.spacing(6)};
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props =>
    props.$disabled ? props.theme.color.action.disabledOverlay : 'transparent'};
`;

export interface AssetSelectorTriggerProps<
  ValueType extends (BalancesResponse | Metadata) | Metadata,
> {
  value?: ValueType;
  actionType?: ActionType;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  layoutId?: string;
}

const AssetSelectorTriggerFunc = <ValueType extends (BalancesResponse | Metadata) | Metadata>(
  {
    value,
    actionType = 'default',
    disabled,
    onClick,
    layoutId,
  }: AssetSelectorTriggerProps<ValueType>,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const density = useDensity();

  const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse.optional(value);

  return (
    <Dialog.Trigger asChild>
      <Trigger
        ref={ref}
        layoutId={layoutId}
        disabled={disabled}
        {...asTransientProps({ density, actionType })}
        onClick={onClick}
      >
        {!value ? (
          <Text small color={color => (disabled ? color.text.muted : color.text.primary)}>
            Asset
          </Text>
        ) : (
          <Value {...asTransientProps({ density, actionType })}>
            <AssetIcon metadata={metadata} size={density === 'sparse' ? 'lg' : 'md'} />
            <Text color={color => (disabled ? color.text.muted : color.text.primary)}>
              {metadata?.symbol ?? 'Unknown'}
            </Text>
          </Value>
        )}

        <IconAdornment $disabled={disabled}>
          <Icon
            IconComponent={ChevronsUpDownIcon}
            size='sm'
            color={color => (disabled ? color.text.muted : color.text.primary)}
          />
        </IconAdornment>
      </Trigger>
    </Dialog.Trigger>
  );
};

export const AssetSelectorTrigger = forwardRef(AssetSelectorTriggerFunc) as <
  ValueType extends (BalancesResponse | Metadata) | Metadata,
>(
  props: AssetSelectorTriggerProps<ValueType> & { ref?: ForwardedRef<HTMLButtonElement> },
) => ReturnType<typeof AssetSelectorTriggerFunc>;
