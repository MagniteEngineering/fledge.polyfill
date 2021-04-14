/* eslint-disable no-undef */
describe('Initial test', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:3000/integration/www/interest-groups.test.html');
	});

	it('should be titled "interest-groups.test"', async () => {
		await expect(await page.title()).toMatch('interest-groups.test');
	});

	it('should provide the fledge code', async () => {
		await expect(await page.title()).toMatch('interest-groups.test');
		const fledge = await page.evaluate(() => Object.keys(window.fledge));
		expect(fledge).toEqual([ 'joinAdInterestGroup', 'leaveAdInterestGroup' ]);
	});
});
