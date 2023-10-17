console.log('web worker running...');

self.onmessage = () => {
  console.log('web worker knows');
  self.postMessage({
    answer: 42,
  });
};
