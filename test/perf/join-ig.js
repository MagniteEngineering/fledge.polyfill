/* eslint-disable no-console, no-undef, new-cap */
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const microtime = require('microtime');

module.exports = async () => {
	console.log('starting performance test for joinAdInterestGroup');

	const numInterestGroups = 100;

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('http://localhost:3000/test/e2e/');
	let totalExecutionTime = 0;
	for (let i = 0; i < numInterestGroups; i++) {
		const name = randomstring.generate(7);
		const start = microtime.now();
		await page.evaluate(name => {
			const fledge = new window.fledge('http://localhost:3000/docs/iframe.html');
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
			}, 60000);
		}, name);
		const end = microtime.now();
		totalExecutionTime += end - start;
	}

	console.log(`total time for ${numInterestGroups} calls: ${totalExecutionTime}µs`);
	console.log(`average call time: ${totalExecutionTime / numInterestGroups}µs`);
	console.log('performance test complete');
	return browser.close();
};

testDef = () => {
	// add user to interest groups 1 - 1000

	// for each number, run 10 times new browser context for each one

};
