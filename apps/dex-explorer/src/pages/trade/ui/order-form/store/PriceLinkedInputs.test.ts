import { describe, expect, it } from 'vitest';
import { PriceLinkedInputs } from './PriceLinkedInputs';

describe('PriceLinkedInputs', () => {
  it('updates the other input, using the price', () => {
    const store = new PriceLinkedInputs();
    store.price = 2;
    store.inputA = '1';
    expect(store.inputA).toEqual('1');
    expect(store.inputB).toEqual('2');
    store.inputB = '10';
    expect(store.inputB).toEqual('10');
    expect(store.inputA).toEqual('5');
  });

  it('will preserve the last edited input when the price changes', () => {
    const store = new PriceLinkedInputs();
    store.inputA = '10';
    expect(store.inputB).toEqual('10');
    store.price = 4;
    expect(store.inputA).toEqual('10');
    expect(store.inputB).toEqual('40');
    store.inputB = '100';
    store.price = 10;
    expect(store.inputA).toEqual('10');
    expect(store.inputB).toEqual('100');
  });

  it('will not update the other input when not a number', () => {
    const store = new PriceLinkedInputs();
    store.inputA = '1';
    expect(store.inputB).toEqual('1');
    store.inputA = 'Dog';
    expect(store.inputB).toEqual('1');
    store.price = 2;
    expect(store.inputB).toEqual('1');
  });
});
