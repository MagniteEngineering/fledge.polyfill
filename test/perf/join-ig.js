/* eslint-disable no-console, no-undef, new-cap */
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const microtime = require('microtime');

module.exports = async () => {
	console.log('starting performance test for joinAdInterestGroup');

	const numInterestGroups = 1;

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('http://localhost:3000/test/e2e/');
	let totalExecutionTime = 0;
	console.log(1);
	for (let i = 0; i < numInterestGroups; i++) {
		const name = randomstring.generate(7);
		const start = microtime.now();
		console.log(2);
		await page.evaluate(name => {
			const fledge = new window.fledge();
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
			}, 60000);
		}, name);
		console.log(3);
		const end = microtime.now();
		totalExecutionTime += end - start;
	}
	console.log(4);

	console.log(`total time for ${numInterestGroups} calls: ${totalExecutionTime}µs`);
	console.log(`average call time: ${totalExecutionTime / numInterestGroups}µs`);
	await browser.close();
	console.log(5);
	console.log('performance test complete');
};

testDef = () => {
	// add user to interest groups 1 - 1000

	// for each number, run 10 times new browser context for each one

};
