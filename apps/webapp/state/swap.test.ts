import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { beforeEach, describe, expect, test } from 'vitest';
import { SwapInputs } from './swap';

describe('Swap Slice', () => {
  const asset1 = {
    inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
    altBaseDenom: '',
    altBech32: '',
  };

  const asset2 = {
    inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
    altBaseDenom: '',
    altBech32: '',
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().swap.pay.amount).toBe('');
    expect(useStore.getState().swap.pay.asset).toBeTruthy();
    expect(useStore.getState().swap.pay.balance).toBe(0);
    expect(useStore.getState().swap.receive.amount).toBe('');
    expect(useStore.getState().swap.receive.asset).toBeTruthy();
    expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
  });

  describe('setAmount', () => {
    describe('pay amount', () => {
      test('pay amount can be set', () => {
        useStore.getState().swap.setAmount(SwapInputs.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
      });

      test('validate pay amount is falsy', () => {
        useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
        useStore.getState().swap.setAssetBalance(10);
        useStore.getState().swap.setAmount(SwapInputs.PAY)('1');
        expect(useStore.getState().swap.pay.amount).toBe('1');
        expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
      });

      test('validate pay amount is truthy when the quantity exceeds the balance of the asset', () => {
        useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
        useStore.getState().swap.setAssetBalance(0.1);
        useStore.getState().swap.setAmount(SwapInputs.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();
      });

      test('validate pay amount is falsy when an asset with a higher balance has changed', () => {
        useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
        useStore.getState().swap.setAssetBalance(0.1);
        useStore.getState().swap.setAmount(SwapInputs.PAY)('2');
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();

        // change asset with higher balance
        useStore.getState().swap.setAsset(SwapInputs.PAY)(asset2);
        useStore.getState().swap.setAssetBalance(20);
        expect(useStore.getState().swap.pay.amount).toBe('2');
        expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
      });
    });

    describe('receive amount', () => {
      test('receive amount can be set', () => {
        useStore.getState().swap.setAmount(SwapInputs.RECEIVE)('2');
        expect(useStore.getState().swap.receive.amount).toBe('2');
      });
    });
  });

  describe('replaceAsset', () => {
    test('replace of assets among themselves when they have value', () => {
      useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
      useStore.getState().swap.setAssetBalance(20);
      useStore.getState().swap.setAmount(SwapInputs.PAY)('1');
      useStore.getState().swap.setAsset(SwapInputs.RECEIVE)(asset2);
      useStore.getState().swap.setAmount(SwapInputs.RECEIVE)('20');
      useStore.getState().swap.replaceAsset();

      expect(useStore.getState().swap.pay.asset.penumbraAssetId).toStrictEqual(asset2);
      expect(useStore.getState().swap.pay.amount).toBe('20');
      expect(useStore.getState().swap.pay.balance).toBe(0);
      expect(useStore.getState().swap.receive.asset.penumbraAssetId).toStrictEqual(asset1);
      expect(useStore.getState().swap.receive.amount).toBe('1');
    });

    test('set pay amount bigger than asset balance, after replace asset with equal balance - validate should be false', () => {
      useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
      useStore.getState().swap.setAssetBalance(1);
      useStore.getState().swap.setAsset(SwapInputs.RECEIVE)(asset2);
      useStore.getState().swap.setAmount(SwapInputs.PAY)('2');

      expect(useStore.getState().swap.validationErrors.pay).toBeTruthy();
      useStore.getState().swap.replaceAsset();
      useStore.getState().swap.setAssetBalance(20);
      expect(useStore.getState().swap.validationErrors.pay).toBeFalsy();
    });
  });

  describe('setAsset', () => {
    test('pay asset can be set', () => {
      useStore.getState().swap.setAsset(SwapInputs.PAY)(asset1);
      expect(useStore.getState().swap.pay.asset.penumbraAssetId).toStrictEqual(asset1);
    });

    test('receive asset can be set', () => {
      useStore.getState().swap.setAsset(SwapInputs.RECEIVE)(asset2);
      expect(useStore.getState().swap.receive.asset.penumbraAssetId).toStrictEqual(asset2);
    });

    test('set pay asset same that receive asset, receive asset should be undefined', () => {
      useStore.getState().swap.setAsset(SwapInputs.RECEIVE)(asset2);
      useStore.getState().swap.setAsset(SwapInputs.PAY)(asset2);

      expect(useStore.getState().swap.pay.asset.penumbraAssetId).toStrictEqual(asset2);
      expect(useStore.getState().swap.receive.asset).toBeTruthy();
    });

    test('set receive asset same that pay asset, pay asset should be undefined', () => {
      useStore.getState().swap.setAsset(SwapInputs.PAY)(asset2);
      useStore.getState().swap.setAsset(SwapInputs.RECEIVE)(asset2);

      expect(useStore.getState().swap.receive.asset.penumbraAssetId).toStrictEqual(asset2);
      expect(useStore.getState().swap.pay.asset).toBeTruthy();
    });
  });

  describe('setAssetBalance', () => {
    test('asset balance can be set', () => {
      useStore.getState().swap.setAssetBalance(10);
      expect(useStore.getState().swap.pay.balance).toBe(10);
    });
  });
});
