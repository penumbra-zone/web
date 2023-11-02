import dynamic from 'next/dynamic';

const SendForm = dynamic(() => import('./send-form'), {
  ssr: false,
});

const Page = () => {
  return <SendForm />;
};

export default Page;
