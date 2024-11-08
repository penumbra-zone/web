import { AccountSelector } from '@penumbra-zone/ui-old/AccountSelector';
import { Card } from '@penumbra-zone/ui-old/Card';
import { FormField } from '@penumbra-zone/ui-old/FormField';
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
