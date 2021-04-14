/* eslint-disable no-undef */
describe('Initial test', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:3000');
	});

	it('should be titled "foo"', async () => {
		await expect(await page.title()).toMatch('foo');
	});
});
