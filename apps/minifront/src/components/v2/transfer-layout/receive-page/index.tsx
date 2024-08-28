import { AccountSelector } from '@penumbra-zone/ui/AccountSelector';
import { Card } from '@penumbra-zone/ui/Card';
import { FormField } from '@penumbra-zone/ui/FormField';
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
