
import { ValueView, Value, ValueView_UnknownDenom } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32AssetId, displayAmount, fromBaseUnitAmount } from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

const ValueViewComponent: React.FC<{
    view?: ValueView,
    value?: Value,
}> = ({ view, value }) => {
    // TODO: is this a good pattern, or should we have a way to promote the value to a view outside
    // of a component?
    if (!view) {
        if (value) {
            const vv = new ValueView({
                valueView: {
                    case: 'unknownDenom',
                    value: new ValueView_UnknownDenom({
                        // TODO: this isn't the right way to do this
                        amount: value.amount!,
                        assetId: value.assetId!,
                    })
                }
            });
            return <ValueViewComponent view={vv} />;
        } else {
            return (<></>);
        }
    }

    if (view.valueView?.case === 'unknownDenom') {
        const value = view.valueView?.value;
        const amount = value.amount || new Amount({ lo: BigInt(0), hi: BigInt(0) });
        const encodedAssetId = bech32AssetId(value.assetId!);
        return (
            <div className='value-view flex font-mono'>
                <p className='text-[15px] leading-[22px]'>
                    {displayAmount(fromBaseUnitAmount(amount, 1))}
                </p>
                <span className='text-sm italic text-foreground font-mono'>{encodedAssetId}</span>
                <CopyToClipboard
                    text={encodedAssetId}
                    label={
                        <div>
                            <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
                        </div>
                    }
                    className='w-4 px-4'
                />
            </div>
        );
    }
    if (view.valueView?.case === 'knownDenom') {
        const value = view.valueView?.value;
        const amount = value.amount || new Amount({ lo: BigInt(0), hi: BigInt(0) });
        const display_denom = value.denom?.display || '';
        // The first denom unit in the list is the display denom, according to cosmos practice
        const exponent = value.denom?.denomUnits[0]?.exponent || 1;
        return (
            <div className='value-view flex font-mono'>
                {displayAmount(fromBaseUnitAmount(amount, exponent))} {display_denom}
            </div>
        );

    }
    return (<></>);
}

export { ValueViewComponent };