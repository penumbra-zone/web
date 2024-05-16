import { Slider } from '@penumbra-zone/ui/components/ui/slider';
import { DURATION_OPTIONS, GDA_RECIPES } from '../../../state/dutch-auction/constants';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AllSlices } from '../../../state';

const durationSliderSelector = (state: AllSlices) => ({
  duration: state.dutchAuction.duration,
  setDuration: state.dutchAuction.setDuration,
});

export const DurationSlider = () => {
  const { duration, setDuration } = useStoreShallow(durationSliderSelector);

  const handleChange = (newValue: number[]) => {
    const value = newValue[0]!; // We don't use multiple values in the slider
    const option = DURATION_OPTIONS[value]!;

    setDuration(option);
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <Slider
        min={0}
        max={DURATION_OPTIONS.length - 1}
        value={[DURATION_OPTIONS.indexOf(duration)]}
        onValueChange={handleChange}
      />

      <div className='flex flex-col items-center'>
        ~ {duration}{' '}
        <span className='text-xs text-muted-foreground'>
          distributed across {GDA_RECIPES[duration].numberOfSubAuctions.toString()} sub-auctions
        </span>
      </div>
    </div>
  );
};
