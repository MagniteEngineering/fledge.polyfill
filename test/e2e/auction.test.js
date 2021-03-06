/* eslint-disable no-undef, new-cap, jest/valid-expect-in-promise */
describe('Fledge', () => {
	describe('runAdAuction', () => {
		it('should error when no parameters sent', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const fledge = await page.evaluate(() => new window.fledge.Fledge('http://localhost:3000/docs/iframe.html'));
			expect(() => fledge.runAdAuction()).toThrow();
		});

		it('should return token when provided minimum required params and valid interest groups', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			await page.evaluate(() => {
				const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
				return new Promise(resolve => {
					fledge.joinAdInterestGroup({
						owner: 'magnite.com',
						name: 'test-interest',
						biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
					}, 1000000).then(() => resolve());
				});
			});

			await page.goto('http://localhost:3000/test/e2e/');
			await page.evaluate(() => {
				const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
				return new Promise(resolve => {
					fledge.joinAdInterestGroup({
						owner: 'magnite.com',
						name: 'test-interest-2',
						biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
					}, 1000000).then(() => resolve());
				});
			});

			const result = await page.evaluate(() => {
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
			expect(result).not.toBeNull();
		});

		it('should return null when no there are no interest groups', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			// call runAdAuction with no interest groups
			const result = await page.evaluate(() => {
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
			expect(result).toBeNull();
			await context.close();
		});
	});
});
