import { describe, it, expect } from 'vitest';
import { nameConnection, parseConnectionName, ChannelLabel } from './channel-names';

describe('nameConnection', () => {
  it('should generate channel names with the specified prefix and label', () => {
    const prefix = 'test';
    const label = ChannelLabel.TRANSPORT;
    const name = nameConnection(prefix, label);
    const segments = name.split(' ');
    expect(segments.length).toBe(3);
    expect(segments[0]).toBe(prefix);
    expect(segments[1]).toBe(label);
    expect(segments[2].length).toBe(36);
  });
});

describe('parseConnectionName', () => {
  it('should parse the prefix and label from a channel name', () => {
    const prefix = 'test';
    const label = ChannelLabel.TRANSPORT;
    const name = nameConnection(prefix, label);
    const parsed = parseConnectionName(prefix, name);
    expect(parsed).not.toBe(undefined);
    expect(parsed!.label).toBe(label);
    expect(parsed!.uuid.length).toBe(36);
  });
});
