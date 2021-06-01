/* eslint-disable no-console, no-undef, new-cap */
const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const microtime = require('microtime');
const fibonacci = require('fibonacci');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const joinAdInterestGroups = async (numGroups, page) => {
	for (let i = 0; i < numGroups; i++) {
		const name = randomstring.generate(7);
		await page.evaluate(name => {
			const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
			return fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name,
				biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
			}, 60000);
		}, name);
	}
};

const runAuction = async page => {
	const start = microtime.now();
	await page.evaluate(() => {
		const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
		return fledge.runAdAuction({
			seller: 'publisher.example',
			decisionLogicUrl: 'http://localhost:3000/test/mocks/dl.js',
			trustedScoringSignalsUrl: 'http://localhost:3000/test/e2e/tss/',
			interestGroupBuyers: '*',
			additionalBids: [
				{
					price: 1,
					class: 'deal',
				},
			],
			auctionSignals: {
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
			sellerSignals: {
				account_id: 1234,
				site_id: 1234,
				zone_id: 1234,
				size_id: 123,
			},
			perBuyerSignals: {
				'dsp.com': {
					content_quality: 230,
				},
			},
		});
	});
	return microtime.now() - start;
};

const runTest = async numInterestGroups => {
	const numAuctions = 10;
	const browser = await puppeteer.launch();
	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();
	await page.goto('http://localhost:3000/test/e2e/');

	await joinAdInterestGroups(numInterestGroups, page);
	let totalExecutionTime = 0;
	for (let i = 0; i < numAuctions; i++) {
		totalExecutionTime += await runAuction(page);
	}
	return totalExecutionTime / numAuctions;
};

const writeToFile = async data => {
	const csvWriter = createCsvWriter({
		path: 'performance-results.csv',
		header: [
			{ id: 'numIgs', title: 'Number of IGs' },
			{ id: 'averageTime', title: 'Average Execution Time' },
		],
	});

	await csvWriter.writeRecords(data);
	console.log('The CSV file was written successfully');
};

module.exports = async () => {
	console.log(`starting performance test for runAdAuction`);
	const maxInterestGroups = 900;
	const results = [];
	for (let i = 1, interestGroups = 1; interestGroups < maxInterestGroups; i++) {
		interestGroups = fibonacci.iterate(i).number;
		console.log(`starting performance test for runAdAuction with ${interestGroups} interest groups.`);
		results.push({
			numIgs: interestGroups,
			averageTime: await runTest(interestGroups),
		});
		console.log(`average call time: ${results[results.length - 1].averageTime}µs`);
		console.log('performance test complete');
	}
	await writeToFile(results);
};
