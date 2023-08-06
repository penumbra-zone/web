import { Metadata } from 'next';
import { Button } from 'ui';

export const metadata: Metadata = {
  title: 'Docs - Turborepo Example',
};

export default function Home() {
  return (
    <div>
      <main>
        <h1>Docs</h1>
        <div>
          <Button />
        </div>
      </main>
    </div>
  );
}
