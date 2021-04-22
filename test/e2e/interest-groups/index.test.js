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
		const result = await page.evaluate(() => {
			let response = 'no error';
			try {
				window.fledge.fledge.joinAdInterestGroup();
			} catch (e) {
				response = 'error';
			}
			return response;
		});
		expect(result).toEqual('error');
	});
});
