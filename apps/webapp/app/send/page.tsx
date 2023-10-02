import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';
import { SendForm } from './send-form';
import { HelperCard } from '../../shared';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />
        <Card gradient className='row-span-2 flex-1 p-5'>
          <Tabs defaultValue='send' className='w-full'>
            <TabsList className='grid w-full grid-cols-3 gap-4'>
              <TabsTrigger value='send'>Send</TabsTrigger>
              <TabsTrigger value='receive'>Receive</TabsTrigger>
              <TabsTrigger value='ibc'>IBC</TabsTrigger>
            </TabsList>
            <TabsContent value='send'>
              <SendForm />
            </TabsContent>
            <TabsContent value='receive'></TabsContent>
            <TabsContent value='ibc'></TabsContent>
          </Tabs>
        </Card>
        <HelperCard src='/funds.svg' label='Sending funds' />
      </div>
    </FadeTransition>
  );
}
