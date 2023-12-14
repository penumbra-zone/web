self.addEventListener('message', async function(e) {
    const { type, data } = e.data;

    if (type === 'worker') {                
        // TODO: Destructure the data object to get individual fields

        // Execute your function using the fields
        const action = await execute_worker();

        // Post message back to offscreen document
        self.postMessage(JSON.stringify(action));
    }
}, false);

async function execute_worker() {
    console.log('web worker running...');
}