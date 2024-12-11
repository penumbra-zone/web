import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '.';
import { useArgs } from '@storybook/preview-api';
import { TextVariant } from './types';

const meta: Meta<typeof Text> = {
  component: Text,
  tags: ['autodocs', '!dev'],
  argTypes: {
    h1: { control: false },
    h2: { control: false },
    h3: { control: false },
    h4: { control: false },
    xxl: { control: false },
    large: { control: false },
    body: { control: false },
    p: { control: false },
    strong: { control: false },
    detail: { control: false },
    small: { control: false },
    technical: { control: false },
    detailTechnical: { control: false },

    as: {
      options: ['span', 'div', 'h1', 'h2', 'h3', 'h4', 'p', 'main', 'section'],
    },
  },
};
export default meta;

const OPTIONS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'large',
  'body',
  'p',
  'strong',
  'detail',
  'small',
  'technical',
  'detailTechnical',
] as TextVariant[];

const Option = ({
  value,
  checked,
  onSelect,
}: {
  value: (typeof OPTIONS)[number];
  checked: boolean;
  onSelect: (value: (typeof OPTIONS)[number]) => void;
}) => (
  <label>
    <input
      type='radio'
      name='textStyle'
      value={value}
      checked={checked}
      onChange={() => onSelect(value)}
    />
    <Text technical>{value}</Text>
  </label>
);
export const KitchenSink: StoryObj<typeof Text> = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    h1: true,
    as: 'span',
    truncate: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onSelect = (option: (typeof OPTIONS)[number]) =>
      updateArgs(
        OPTIONS.reduce(
          (prev, curr) => ({
            ...prev,
            [curr]: curr === option ? true : undefined,
          }),
          {},
        ),
      );

    const isChecked = (option: TextVariant): boolean =>
      Object.keys(props).some(key => key === option);

    return (
      <form className='flex flex-col gap-2 text-text-primary'>
        <div className='flex items-center gap-2'>
          <Text>Text style:</Text>
          {OPTIONS.map(option => (
            <Option key={option} value={option} checked={isChecked(option)} onSelect={onSelect} />
          ))}
        </div>

        <Text {...props} />
      </form>
    );
  },
};

export const UsageExample: StoryObj<typeof Text> = {
  render: function Render() {
    return (
      <div className='text-text-primary'>
        <Text h1>h1. Typography</Text>
        <Text h2>h2. This is a section</Text>
        <Text p>
          <Text strong>Here is some filler text:</Text> Giggster kickstarter painting with light
          academy award charlie kaufman shotdeck breakdown services indie white balance. Student
          emmys sound design ots character arc low angle coming-of-age composition. Storyboard beat
          sheet greenlight cowboy shot margarita shot blocking foley stage seed&spark.
        </Text>

        <Text p>
          Shot list low angle mit out sound telephoto rec.709 high angle eyeline assembly cut 8 1/2
          dga. Post-viz circle of confusion location scout unpaid internship reality of doing genre
          film. Jean-luc godard ilm symbolism alexa mini white balance margarita shot. Jordan peele
          log line ryan coogler actors access.
        </Text>

        <Text h2>h2. Section two</Text>
        <Text p>
          Silent film conflict sound design blocking script treatment. Teal and orange composition
          fotokem third act blackmagic ingmar bergman jordan peele rembrandt lighting critical
          darling silent film. Wes anderson arthouse diegetic sound after effects.
        </Text>

        <Text large>This is some large text.</Text>

        <Text p>
          White balance crafty debut film pan up 180-degree rule academy award exposure triangle
          director&apos;s vision. Lavs led wall the actor prepares wrylies character arc stinger
          sanford meisner. Given circumstances under-exposed jordan peele color grade nomadland team
          deakins crafty dogme 95. French new wave pan up save the cat contrast ratio blue filter
          cinema studies super 16 jump cut cannes unreal engine.
        </Text>

        <Text p>
          Establishing shot stella adler ludwig göransson first-time director shotdeck fotokem
          over-exposed flashback reality of doing color grade. Fetch coffee student emmys indie key
          light rembrandt lighting. Undercranking beat beat scriptnotes podcast. Sound design
          academy award day-for-night christopher nolan undercranking. Unreal engine visionary match
          cut grain vs. noise 35mm anti-hero production design.
        </Text>
      </div>
    );
  },
};
