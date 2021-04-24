/* eslint-disable no-undef */

describe('Fledge', () => {
	beforeEach(async () => {
		await page.goto('http://localhost:3000/test/e2e/');
	});

	it('should be contain "fledge" in the title', async () => {
		await expect(await page.title()).toMatch(/fledge/i);
	});

	it('should provide the API methods', async () => {
		const fledge = await page.evaluate(() => window.fledge);
		expect(Object.keys(fledge)).toEqual([ 'runAdAuction', 'joinAdInterestGroup', 'leaveAdInterestGroup' ]);
	});
});
