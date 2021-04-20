/* eslint-disable no-undef */

describe('Fledge', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:3000/test/e2e/interest-groups/');
	});

	it('should be contain "fledge" in the title', async () => {
		await expect(await page.title()).toMatch(/fledge/i);
	});

	it('should provide the API methods', async () => {
		const fledge = await page.evaluate(() => window.fledge.fledge);
		expect(Object.keys(fledge)).toEqual([ 'runAdAuction', 'joinAdInterestGroup', 'leaveAdInterestGroup' ]);
	});
});
