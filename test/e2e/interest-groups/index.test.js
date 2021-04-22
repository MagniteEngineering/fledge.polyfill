/* eslint-disable no-undef */

describe('Initial test', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:3000/test/e2e/interest-groups/');
	});

	it('should be titled "interest-groups.test"', async () => {
		await expect(await page.title()).toMatch('interest-groups.test');
	});

	it('should provide the fledge code', async () => {
		await expect(await page.title()).toMatch('interest-groups.test');
		const fledge = await page.evaluate(() => window.fledge.fledge);
		expect(Object.keys(fledge)).toEqual([ 'joinAdInterestGroup', 'leaveAdInterestGroup' ]);
	});
});

describe('joinAdInterestGroup', () => {
	beforeEach(async () => {
		await page.goto('http://localhost:3000/test/e2e/interest-groups/');
	});

	it('should error when no parameters sent', async () => {
		let errorThrown = false;
		try {
			await page.evaluate(() =>
				window.fledge.fledge.joinAdInterestGroup(),
			);
		} catch (e) {
			errorThrown = true;
		}
		expect(errorThrown).toBe(true);
	});

	it('should not error went provided minimum required params', async () => {
		let errorThrown = false;
		try {
			await page.evaluate(() =>
				window.fledge.fledge.joinAdInterestGroup({
					owner: 'magnite.com',
					name: 'test-interest',
					bidding_logic_url: 'https://fledge.magnite.com/bl.js',
				}, 60000),
			);
		} catch (e) {
			errorThrown = true;
		}
		expect(errorThrown).toBe(false);
	});
});
