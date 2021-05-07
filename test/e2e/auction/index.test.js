/* eslint-disable no-undef */
/* eslint-disable new-cap */
describe('Fledge', () => {
	describe('runAdAuction', () => {
		beforeEach(async () => {
			await page.goto('http://localhost:3000/test/e2e/');
		});

		it('should error when no parameters sent', async () => {
			const fledge = await page.evaluate(() => new window.fledge());
			expect(() => fledge.runAdAuction()).toThrow();
		});

		it('should return token when provided minimum required params and valid interest groups', async () => {
			await page.evaluate(() => {
				const fledge = new window.fledge();
				return fledge.joinAdInterestGroup({
					owner: 'magnite.com',
					name: 'test-interest',
					bidding_logic_url: 'http://localhost:3000/test/e2e/mock/bl.js',
				}, 100000);
			});

			const result = await page.evaluate(() => {
				const fledge = new window.fledge();
				return fledge.runAdAuction({
					seller: 'publisher.example',
					decision_logic_url: 'http://localhost:3000/test/e2e/mock/dl.js',
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
			// handle race condition on windows
			await result;
			expect(typeof result).toBe('string');
		});

		it('should return null when no there are no interest groups', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			// call runAdAuction with no interest groups
			const result = await page.evaluate(() => {
				const fledge = new window.fledge();
				return fledge.runAdAuction({
					seller: 'publisher.example',
					decision_logic_url: 'http://localhost:3000/test/e2e/mock/dl.js',
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
			expect(result).toBeNull();
			await context.close();
		});
	});
});
