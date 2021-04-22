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
	beforeAll(async () => {
		await page.goto('http://localhost:3000/test/e2e/interest-groups/');
	});

	it('should error when no parameters sent', async () => {
		let errorThrown = false;
		try {
			await page.evaluate(async () => {
				await window.fledge.fledge.joinAdInterestGroup();
			});
		} catch (e) {
			errorThrown = true;
		}
		expect(errorThrown).toBe(true);
	});
});
