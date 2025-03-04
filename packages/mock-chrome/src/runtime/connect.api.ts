import { mockChannel } from './channel.mock.js';

const mockedChannel = mockChannel();

export default mockedChannel.connect;

export const { onConnect, mockSenders, mockPorts } = mockedChannel;
