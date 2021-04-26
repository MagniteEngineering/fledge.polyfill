import fledge from '../../src/';

describe('Render', () => {
	describe('renderAd', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no parameters are provided', async () => {
					await expect(() => fledge.renderAd()).rejects.toThrow();
				});

				it('should throw an Error when parameters are not valid String', async () => {
					await expect(() => fledge.renderAd('.selector', undefined)).rejects.toThrow();
					await expect(() => fledge.renderAd(undefined, 'uuid')).rejects.toThrow();
					await expect(() => fledge.renderAd('.selector', true)).rejects.toThrow();
					await expect(() => fledge.renderAd(true, 'uuid')).rejects.toThrow();
					await expect(() => fledge.renderAd('.selector', 0)).rejects.toThrow();
					await expect(() => fledge.renderAd(0, 'uuid')).rejects.toThrow();
					await expect(() => fledge.renderAd('.selector', () => { /* noOp */ })).rejects.toThrow();
					await expect(() => fledge.renderAd(() => { /* noOp */ }, 'uuid')).rejects.toThrow();
					await expect(() => fledge.renderAd('.selector', null)).rejects.toThrow();
					await expect(() => fledge.renderAd(null, 'uuid')).rejects.toThrow();
				});
			});

			describe('DOM manipulation', () => {
				it('should throw an Error when the target is not found', async () => {
				});

				it('should throw an Error when the rendered iframe is not found', async () => {
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
				const frame = await fledge.renderAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3');
				await expect(frame).toBe(true);
			});
		});
	});
});
