/* eslint-disable no-undef, new-cap */
describe('Fledge', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:3000/test/e2e/');
	});

	it('should be contain "fledge" in the title', async () => {
		await expect(await page.title()).toMatch(/fledge/i);
	});

	it('should provide the API methods', async () => {
		const hasJoinAdInterestGroup = await page.evaluate(() => {
			const fledge = new window.fledge('http://localhost:3000/docs/iframe.html');
			return fledge.joinAdInterestGroup && typeof fledge.joinAdInterestGroup === 'function';
		});
		expect(hasJoinAdInterestGroup).toBe(true);

		const hasLeaveAdInterestGroup = await page.evaluate(() => {
			const fledge = new window.fledge('http://localhost:3000/docs/iframe.html');
			return fledge.leaveAdInterestGroup && typeof fledge.leaveAdInterestGroup === 'function';
		});
		expect(hasLeaveAdInterestGroup).toBe(true);

		const hasRenderAd = await page.evaluate(() => {
			const fledge = new window.fledge('http://localhost:3000/docs/iframe.html');
			return fledge.renderAd && typeof fledge.renderAd === 'function';
		});
		expect(hasRenderAd).toBe(true);

		const hasRunAdAuction = await page.evaluate(() => {
			const fledge = new window.fledge('http://localhost:3000/docs/iframe.html');
			return fledge.runAdAuction && typeof fledge.runAdAuction === 'function';
		});
		expect(hasRunAdAuction).toBe(true);
	});
});
