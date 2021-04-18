module.exports = {
	preset: 'jest-puppeteer',
	setupFiles: [
		'fake-indexeddb/auto',
	],
	verbose: true,
};
