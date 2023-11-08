import { useState } from 'react';

import '@penumbra-zone/ui/styles/globals.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <span className='text-3xl text-rust'>Hello world!</span>
      </div>
      <h1>Vite + React</h1>
      <div>
        <button onClick={() => setCount(count => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p>Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
