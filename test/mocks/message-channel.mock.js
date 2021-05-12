(function mockMessageChannel () {
	const MessageChannel = function () {
		return {
			port1: {
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				start: jest.fn(),
				close: jest.fn(),
				postMessage: jest.fn(),
			},
			port2: {
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				start: jest.fn(),
				close: jest.fn(),
				postMessage: jest.fn(),
			},
		};
	};

	global.MessageChannel = MessageChannel;
	global.onmessage = jest.fn();
})();
