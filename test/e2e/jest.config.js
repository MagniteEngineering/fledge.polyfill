module.exports = {
	displayName: 'End-to-End Integration Tests',
	preset: 'jest-puppeteer',
	setupFiles: [
		'fake-indexeddb/auto',
	],
};
