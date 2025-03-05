import { ValueViewComponent } from '../ValueView';
import { Density } from '../Density';
import { SummaryBalance as SummaryBalanceType } from './adapt-effects';

export interface SummaryBalanceProps {
  balance: SummaryBalanceType;
}

export const SummaryBalance = ({ balance }: SummaryBalanceProps) => {
  return (
    <Density slim>
      <ValueViewComponent
        valueView={balance.view}
        showIcon={false}
        signed={balance.negative ? 'negative' : 'positive'}
        priority='tertiary'
      />
    </Density>
  );
};
