/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable new-cap */
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
			const fledge = new window.fledge();
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				bidding_logic_url: 'http://localhost:3000/test/e2e/mock/bl.js',
			}, 60000);
		}, name);
		const end = microtime.now();
		totalExecutionTime += end - start;
	}

	console.log(`total time for ${numInterestGroups} calls: ${totalExecutionTime}µs`);
	console.log(`average call time: ${totalExecutionTime / numInterestGroups}µs`);
	await browser.close();
	console.log('performance test complete');
};
