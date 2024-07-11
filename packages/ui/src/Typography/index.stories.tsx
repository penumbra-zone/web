import type { Meta, StoryObj } from '@storybook/react';

import { Body, Detail, H1, H2, H3, H4, Large, P, Small, Strong, Technical } from '.';
import styled from 'styled-components';

const meta: Meta<typeof Body> = {
  title: 'Typography',
  tags: ['autodocs'],
};
export default meta;

const Wrapper = styled.div({ color: 'white' });

export const KitchenSink: StoryObj = {
  render: function Render() {
    return (
      <Wrapper>
        <H1>H1: This is a heading</H1>
        <H2>H2: This is a heading</H2>
        <H3>H3: This is a heading</H3>
        <H4>H4: This is a heading</H4>
        <Large as='p'>Large: This is large text used for section titles</Large>
        <Body as='p'>Body: This is body text used throughout most of our UIs</Body>
        <Strong as='p'>Strong: This is emphasized body text used in various components</Strong>
        <Small as='p'>Small: This is small text used for secondary information</Small>
        <Detail as='p'>
          Detail: This is detail text used for small bits of tertiary information
        </Detail>
        <Technical as='p'>
          Technical: This is monospaced text used for code, values, and other technical information
        </Technical>
      </Wrapper>
    );
  },
};

export const UsageExample: StoryObj<typeof Body> = {
  render: function Render() {
    return (
      <Wrapper>
        <H1>h1. Typography</H1>
        <H2>h2. This is a section</H2>
        <P>
          <Strong>Here is some filler text:</Strong> Giggster kickstarter painting with light
          academy award charlie kaufman shotdeck breakdown services indie white balance. Student
          emmys sound design ots character arc low angle coming-of-age composition. Storyboard beat
          sheet greenlight cowboy shot margarita shot blocking foley stage seed&spark.
        </P>

        <P>
          Shot list low angle mit out sound telephoto rec.709 high angle eyeline assembly cut 8 1/2
          dga. Post-viz circle of confusion location scout unpaid internship reality of doing genre
          film. Jean-luc godard ilm symbolism alexa mini white balance margarita shot. Jordan peele
          log line ryan coogler actors access.
        </P>

        <H2>h2. Section two</H2>
        <P>
          Silent film conflict sound design blocking script treatment. Teal and orange composition
          fotokem third act blackmagic ingmar bergman jordan peele rembrandt lighting critical
          darling silent film. Wes anderson arthouse diegetic sound after effects.
        </P>

        <Large>This is some large text.</Large>

        <P>
          White balance crafty debut film pan up 180-degree rule academy award exposure triangle
          director&apos;s vision. Lavs led wall the actor prepares wrylies character arc stinger
          sanford meisner. Given circumstances under-exposed jordan peele color grade nomadland team
          deakins crafty dogme 95. French new wave pan up save the cat contrast ratio blue filter
          cinema studies super 16 jump cut cannes unreal engine.
        </P>

        <P>
          Establishing shot stella adler ludwig göransson first-time director shotdeck fotokem
          over-exposed flashback reality of doing color grade. Fetch coffee student emmys indie key
          light rembrandt lighting. Undercranking beat beat scriptnotes podcast. Sound design
          academy award day-for-night christopher nolan undercranking. Unreal engine visionary match
          cut grain vs. noise 35mm anti-hero production design.
        </P>
      </Wrapper>
    );
  },
};
