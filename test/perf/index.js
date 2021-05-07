/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable new-cap */
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');

(async () => {
	console.log('starting performance test');

	const numInterestGroups = 100;

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('http://localhost:3000/test/e2e/');
	let totalExecutionTime = 0;

	for (let i = 0; i < numInterestGroups; i++) {
		const name = randomstring.generate(7);
		const start = new Date();
		await page.evaluate(name => {
			const fledge = new window.fledge();
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				bidding_logic_url: 'http://localhost:3000/test/e2e/mock/bl.js',
			}, 60000);
		}, name);
		const end = new Date();
		totalExecutionTime += end.getTime() - start.getTime();
	}

	console.log(`total time for ${numInterestGroups} calls: ${totalExecutionTime}ms`);
	console.log(`average call time: ${totalExecutionTime / numInterestGroups}ms`);
	await browser.close();
	console.log('performance test complete');
})();
