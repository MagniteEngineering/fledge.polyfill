/* eslint-disable no-undef */

describe('joinAdInterestGroup', () => {
	beforeEach(async () => {
		await page.goto('http://localhost:3000/test/e2e/interest-groups/');
	});

	it('should error when no parameters sent', async () => {
		const fledge = await page.evaluate(() => window.fledge.fledge);
		expect(() => fledge.joinAdInterestGroup()).toThrow();
	});

	it('should return true when provided minimum required params', async () => {
		const fledge = await page.evaluate(() =>
			window.fledge.fledge.joinAdInterestGroup({
				owner: 'magnite.com',
				name: 'test-interest',
				bidding_logic_url: 'https://fledge.magnite.com/bl.js',
			}, 60000),
		);
		expect(fledge).toBe(true);
	});

	it('should store expected data in local storage', async () => {
		const igObject = {
			owner: 'magnite.com',
			name: 'test-interest',
			bidding_logic_url: 'https://fledge.magnite.com/bl.js',
		};
		const expiry = 60000;
		await page.evaluate((igObject, expiry) =>
			window.fledge.fledge.joinAdInterestGroup(igObject, expiry),
		igObject,
		expiry,
		);
		const result = await page.evaluate(() => {
			// eslint-disable-next-line
			const myPromise = new Promise((resolve, reject) => {
				const request = window.indexedDB.open('Fledge');
				request.onsuccess = () => {
					const db = request.result;
					db.transaction('interest-groups', 'readonly').objectStore('interest-groups').get('magnite.com-test-interest').onsuccess = function (event) {
						resolve(event.target.result);
					};
				};
			});
			return myPromise;
		});
		expect(result.owner).toBe(igObject.owner);
		expect(result.name).toBe(igObject.name);
		expect(result.bidding_logic_url).toBe(igObject.bidding_logic_url);
	});
});
