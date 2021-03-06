/* eslint-disable no-undef, new-cap */
describe('Fledge', () => {
	describe('joinAdInterestGroup', () => {
		beforeEach(async () => {
			await jestPuppeteer.resetBrowser();
		});

		it('should error when no parameters sent', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const fledge = await page.evaluate(() => new window.fledge.Fledge('http://localhost:3000/docs/iframe.html'));
			expect(() => fledge.joinAdInterestGroup()).toThrow();
		});

		it('should return when provided minimum required params', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const result = await page.evaluate(() => {
				const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
				return fledge.joinAdInterestGroup({
					owner: 'magnite.com',
					name: 'test-interest',
					biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
				}, 60000);
			});
			expect(result).toBeUndefined();
		});

		it('should store expected data in local storage', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const igObject = {
				owner: 'magnite.com',
				name: 'test-interest',
				biddingLogicUrl: 'http://localhost:3000/test/mocks/bl.js',
			};
			const expiry = 60000;
			await page.evaluate((igObject, expiry) => {
				const fledge = new window.fledge.Fledge('http://localhost:3000/docs/iframe.html');
				return fledge.joinAdInterestGroup(igObject, expiry);
			}, igObject, expiry);
			await page.goto('http://localhost:3000/test/e2e/');
			const result = await page.evaluate(() =>
				new Promise(resolve => {
					const request = window.indexedDB.open('fledge.v1');
					request.onsuccess = () => {
						const db = request.result;
						db.transaction('interest-groups', 'readonly').objectStore('interest-groups').get('magnite.com-test-interest').onsuccess = function (event) {
							resolve(event.target.result);
						};
						db.close();
					};
				}),
			);
			expect(result.owner).toBe(igObject.owner);
			expect(result.name).toBe(igObject.name);
			expect(result.biddingLogicUrl).toBe(igObject.biddingLogicUrl);
		});
	});
});
