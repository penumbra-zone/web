import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AnimationPlaybackControls, motion, useAnimate } from 'framer-motion';
import styled from 'styled-components';
import { buttonBase } from '../../../utils/button';
import { isBalancesResponse, isMetadata } from '../../helpers';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { AssetIcon } from '../../../AssetIcon';
import { Text } from '../../../Text';
import { Balance } from './Balance';
import { useIsAnimating } from '../../../hooks/useIsAnimating';
import { useEffect, useRef } from 'react';

const Root = styled(motion.button)<{ $isSelected: boolean }>`
  ${buttonBase}

  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.theme.color.other.tonalFill10};
  padding: ${props => props.theme.spacing(3)};

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: ${props => (props.$isSelected ? props.theme.spacing(3) : 0)} 0;

  text-align: left;
`;

const AssetIconAndName = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

export interface MetadataOrBalancesResponseProps {
  value: Metadata | BalancesResponse;
  isSelected: boolean;
  onSelect: VoidFunction;
}

export const MetadataOrBalancesResponse = ({
  value,
  isSelected,
  onSelect,
}: MetadataOrBalancesResponseProps) => {
  const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse.optional()(value);
  const isParentAnimating = useIsAnimating();
  const [scope, animate] = useAnimate();
  const animationControls = useRef<AnimationPlaybackControls | undefined>();

  /**
   * We delay the animation of making the metadata/balances response appear
   * until the parent is finished animating. Otherwise, these will transition in
   * weirdly, since the `layout` prop is applied to `Root`.
   *
   * @todo: Find a more elegant solution for waiting for a parent layout
   * animation to finish before starting a child animation. Framer Motion has
   * solutions for orchestration
   * (https://www.framer.com/motion/animation/##orchestration), but they don't
   * seem to work with shared layout animations.
   */
  useEffect(() => {
    if (isParentAnimating) {
      animationControls.current?.cancel();
      animationControls.current = animate(scope.current, { opacity: 0 });
    } else {
      animationControls.current?.cancel();
      animationControls.current = animate(scope.current, { opacity: 1 });
    }
  }, [animate, isParentAnimating, scope]);

  return (
    <Root layout $isSelected={isSelected} onClick={onSelect} ref={scope} initial={{ opacity: 0 }}>
      <AssetIconAndName>
        <AssetIcon metadata={metadata} />
        <div>
          {metadata?.name && <Text as='div'>{metadata.name}</Text>}
          {metadata?.symbol && (
            <Text detail color={color => color.text.secondary} as='div'>
              {metadata.symbol}
            </Text>
          )}
        </div>
      </AssetIconAndName>

      {isBalancesResponse(value) && <Balance balancesResponse={value} />}
    </Root>
  );
};
