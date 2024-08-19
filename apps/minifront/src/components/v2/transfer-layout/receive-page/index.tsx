import { AccountSelector } from '@repo/ui/AccountSelector';
import { Card } from '@repo/ui/Card';
import { FormField } from '@repo/ui/FormField';
import { getAddrByIndex } from '../../../../fetchers/address';

export const ReceivePage = () => {
  return (
    <Card.Stack>
      <Card.Section>
        <FormField label='Address'>
          <AccountSelector getAddressByIndex={getAddrByIndex} />
        </FormField>
      </Card.Section>
    </Card.Stack>
  );
};
