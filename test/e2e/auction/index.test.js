/* eslint-disable no-undef */
describe('Fledge', () => {
	describe('runAdAuction', () => {
		beforeEach(async () => {
			await page.goto('http://localhost:3000/test/e2e/');
		});

		it('should error when no parameters sent', async () => {
			const fledge = await page.evaluate(() => window.fledge);
			expect(() => fledge.joinAdInterestGroup()).toThrow();
		});

		it('should return token when provided minimum required params', async () => {
			const result = await page.evaluate(() =>
				window.fledge.runAdAuction({
					seller: 'publisher.example',
					decision_logic_url: 'https://fledge.magnite.com/dl.js',
					trusted_scoring_signals_url: 'https://fledge.magnite.com/tss/',
					interest_group_buyers: '*',
					addition_bids: [
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
				}),
			);
			expect(result).toBe('1234');
		});
	});
});
