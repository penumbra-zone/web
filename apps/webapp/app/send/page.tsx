import { Card, FadeTransition, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';
import { SendForm } from './send-form';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-82px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <div />

        <Card gradient className='flex-1 p-5'>
          <Tabs defaultValue='send' className='w-full gap-4'>
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

        <Card gradient className='flex-1 p-5'>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has
            survived not only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset learn more
          </p>
        </Card>
      </div>
    </FadeTransition>
  );
}
