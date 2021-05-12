/* eslint-disable no-console, no-undef, new-cap */
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const microtime = require('microtime');

const joinAdInterestGroups = async (numGroups, page) => {
	for (let i = 0; i < numGroups; i++) {
		const name = randomstring.generate(7);
		await page.evaluate(name => {
			const fledge = new window.fledge();
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				bidding_logic_url: 'http://localhost:3000/test/mocks/bl.js',
			}, 60000);
		}, name);
	}
};

module.exports = async () => {
	const numInterestGroups = 1;
	const numAuctions = 1;

	console.log(`starting performance test for runAdAuction with ${numInterestGroups} interest groups.`);

	const browser = await puppeteer.launch();
	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();
	await page.goto('http://localhost:3000/test/e2e/');

	await joinAdInterestGroups(numInterestGroups, page);

	let totalExecutionTime = 0;
	for (let i = 0; i < numAuctions; i++) {
		const start = microtime.now();
		await page.evaluate(() => {
			const fledge = new window.fledge();
			return fledge.runAdAuction({
				seller: 'publisher.example',
				decision_logic_url: 'http://localhost:3000/test/mocks/dl.js',
				trusted_scoring_signals_url: 'http://localhost:3000/test/e2e/tss/',
				interest_group_buyers: '*',
				additional_bids: [
					{
						price: 1,
						class: 'deal',
					},
				],
				auction_signals: {
					size: {
						w: 300,
						h: 200,
					},
					content: [
						'news',
						'politics',
						'us',
						'election',
					],
					location: 'atf',
				},
				seller_signals: {
					account_id: 1234,
					site_id: 1234,
					zone_id: 1234,
					size_id: 123,
				},
				per_buyer_signals: {
					'dsp.com': {
						content_quality: 230,
					},
				},
			});
		});
		const end = microtime.now();
		totalExecutionTime += end - start;
	}
	console.log(`total time for ${numAuctions} calls: ${totalExecutionTime}µs`);
	console.log(`average call time: ${totalExecutionTime / numInterestGroups}µs`);
	await browser.close();
	console.log('performance test complete');
};
