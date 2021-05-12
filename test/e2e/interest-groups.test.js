/* eslint-disable no-undef, new-cap */
describe('Fledge', () => {
	describe('joinAdInterestGroup', () => {
		it('should error when no parameters sent', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const fledge = await page.evaluate(() => new window.fledge());
			expect(() => fledge.joinAdInterestGroup()).toThrow();
		});

		it('should return true when provided minimum required params', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const result = await page.evaluate(() => {
				const fledge = new window.fledge();
				return fledge.joinAdInterestGroup({
					owner: 'magnite.com',
					name: 'test-interest',
					bidding_logic_url: 'http://localhost:3000/test/mocks/bl.js',
				}, 60000);
			});
			expect(result).toBe(true);
		});

		it('should store expected data in local storage', async () => {
			const context = await browser.createIncognitoBrowserContext();
			const page = await context.newPage();
			await page.goto('http://localhost:3000/test/e2e/');

			const igObject = {
				owner: 'magnite.com',
				name: 'test-interest',
				bidding_logic_url: 'http://localhost:3000/test/mocks/bl.js',
			};
			const expiry = 60000;
			await page.evaluate((igObject, expiry) => {
				const fledge = new window.fledge();
				return fledge.joinAdInterestGroup(igObject, expiry);
			}, igObject, expiry);
			await page.goto('http://localhost:3000/test/e2e/');
			const result = await page.evaluate(() =>
				new Promise(resolve => {
					const request = window.indexedDB.open('Fledge');
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
			expect(result.bidding_logic_url).toBe(igObject.bidding_logic_url);
		});
	});
});
