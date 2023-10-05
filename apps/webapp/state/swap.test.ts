import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { beforeEach, describe, expect, test } from 'vitest';
import { SwapToken } from './swap';

describe('Swap Slice', () => {
  const asset1 = {
    name: 'BNB 1',
    icon: '/test-asset-icon-2.svg',
    balance: 1,
  };

  const asset2 = {
    name: 'BNB 2',
    icon: '/test-asset-icon-2.svg',
    balance: 10,
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().swap.pay.amount).toBe('');
    expect(useStore.getState().swap.pay.asset).toBeUndefined();
    expect(useStore.getState().swap.receive.amount).toBe('');
    expect(useStore.getState().swap.receive.asset).toBeUndefined();
    expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
    expect(useStore.getState().swap.validationErrors.receive).toBeFalsy();
  });

  describe('setAmount', () => {
    describe('pay amount', () => {
      test('pay amount can be set', () => {
        useStore.getState().swap.setAmount(SwapToken.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
      });

      test('validate pay amount is falsy', () => {
        useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
        useStore.getState().swap.setAmount(SwapToken.PAY)('1');
        expect(useStore.getState().swap.pay.amount).toBe('1');
        expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
      });

      test('validate pay amount is truthy when the quantity exceeds the balance of the asset', () => {
        useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
        useStore.getState().swap.setAmount(SwapToken.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();
      });

      test('validate pay amount is falsy when an asset with a higher balance has changed', () => {
        const asset2 = {
          name: 'BNB 1',
          icon: '/test-asset-icon-2.svg',
          balance: 2,
        };

        useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
        useStore.getState().swap.setAmount(SwapToken.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();

        // change asset with higher balance
        useStore.getState().swap.setAsset(SwapToken.PAY)(asset2);
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
      });
    });

    describe('receive amount', () => {
      test('receive amount can be set', () => {
        useStore.getState().swap.setAmount(SwapToken.RECEIVE)('2');
        expect(useStore.getState().swap.receive.amount).toBe('2');
      });

      test('validate receive amount is falsy', () => {
        useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset1);
        useStore.getState().swap.setAmount(SwapToken.RECEIVE)('1');
        expect(useStore.getState().swap.receive.amount).toBe('1');
        expect(useStore.getState().swap.validationErrors.receive).toBeFalsy();
      });

      test('validate receive amount is truthy when the quantity exceeds the balance of the asset', () => {
        useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset1);
        useStore.getState().swap.setAmount(SwapToken.RECEIVE)('2');
        expect(useStore.getState().swap.receive.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.receive).toBeTruthy();
      });

      test('validate receive amount is falsy when an asset with a higher balance has changed', () => {
        const asset2 = {
          name: 'BNB 1',
          icon: '/test-asset-icon-2.svg',
          balance: 2,
        };

        useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset1);
        useStore.getState().swap.setAmount(SwapToken.RECEIVE)('2');
        expect(useStore.getState().swap.receive.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.receive).toBeTruthy();

        // change asset with higher balance
        useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
        expect(useStore.getState().swap.receive.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.receive).toBeFalsy();
      });
    });
  });

  describe('replaceAsset', () => {
    test('replace of assets among themselves when they have value', () => {
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
      useStore.getState().swap.replaceAsset();

      expect(useStore.getState().swap.pay.asset).toBe(asset2);
      expect(useStore.getState().swap.receive.asset).toBe(asset1);
    });

    test('replace of assets among themselves when pay hasn`t asset', () => {
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
      useStore.getState().swap.replaceAsset();

      expect(useStore.getState().swap.pay.asset).toBe(asset2);
      expect(useStore.getState().swap.receive.asset).toBeUndefined();
    });

    test('replace of assets among themselves when receive hasn`t asset', () => {
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
      useStore.getState().swap.replaceAsset();

      expect(useStore.getState().swap.receive.asset).toBe(asset1);
      expect(useStore.getState().swap.pay.asset).toBeUndefined();
    });

    test('set pay amount bigger than asset balance, after replace asset with equal balance - validate should be false', () => {
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
      useStore.getState().swap.setAmount(SwapToken.PAY)('2');

      expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();
      useStore.getState().swap.replaceAsset();
      expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
    });

    test('set receive amount bigger than asset balance, after replace asset with equal balance - validate should be false', () => {
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset2);
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset1);
      useStore.getState().swap.setAmount(SwapToken.RECEIVE)('2');

      expect(useStore.getState().swap.validationErrors.receive).toBeTruthy();
      useStore.getState().swap.replaceAsset();
      expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
    });
  });

  describe('setAsset', () => {
    test('pay asset can be set', () => {
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset1);
      expect(useStore.getState().swap.pay.asset).toBe(asset1);
    });

    test('receive asset can be set', () => {
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
      expect(useStore.getState().swap.receive.asset).toBe(asset2);
    });

    test('set pay asset same that receive asset, receive asset should be undefined', () => {
      useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);
      useStore.getState().swap.setAsset(SwapToken.PAY)(asset2);

      expect(useStore.getState().swap.pay.asset).toBe(asset2);
      expect(useStore.getState().swap.receive.asset).toBeUndefined();
    });

    test('set receive asset same that pay asset, pay asset should be undefined', () => {
			useStore.getState().swap.setAsset(SwapToken.PAY)(asset2);
			useStore.getState().swap.setAsset(SwapToken.RECEIVE)(asset2);

      expect(useStore.getState().swap.receive.asset).toBe(asset2);
      expect(useStore.getState().swap.pay.asset).toBeUndefined();
    });
  });
});
