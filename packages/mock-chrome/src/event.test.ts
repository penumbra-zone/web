import { describe, expect, it, vi } from 'vitest';
import { mockEvent } from './event.mock.js';

describe('mockEvent', () => {
  it('should manage listeners', () => {
    const event = mockEvent();

    const listener = vi.fn();
    const listener2 = vi.fn();

    event.addListener(listener);

    expect(event.hasListeners()).toBe(true);
    expect(event.hasListener(listener)).toBe(true);
    expect(event.hasListener(listener2)).toBe(false);

    event.removeListener(listener);
    expect(event.hasListeners()).toBe(false);
    expect(event.hasListener(listener)).toBe(false);
    expect(event.hasListener(listener2)).toBe(false);

    event.addListener(listener2);
    expect(event.hasListeners()).toBe(true);
    expect(event.hasListener(listener)).toBe(false);
    expect(event.hasListener(listener2)).toBe(true);

    event.dispatch('yeah');

    expect(listener).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith('yeah');

    // directly manipulate internal state
    event.listeners.has(listener2);
    event.listeners.clear();
    expect(event.hasListeners()).toBe(false);
    expect(event.hasListener(listener2)).toBe(false);

    event.listeners.add(listener);
    expect(event.hasListeners()).toBe(true);
    expect(event.hasListener(listener)).toBe(true);
  });
});
