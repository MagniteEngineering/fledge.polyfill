/* eslint-disable compat/compat */
import renderAd from '../../../src/api/render';

describe('Render', () => {
	describe('renderAd', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no parameters are provided', async () => {
					await expect(() => renderAd()).rejects.toThrow();
				});

				it('should throw an Error when parameters are not valid String', async () => {
					await expect(() => renderAd('.selector', undefined)).rejects.toThrow();
					await expect(() => renderAd(undefined, 'uuid')).rejects.toThrow();
					await expect(() => renderAd('.selector', true)).rejects.toThrow();
					await expect(() => renderAd(true, 'uuid')).rejects.toThrow();
					await expect(() => renderAd('.selector', 0)).rejects.toThrow();
					await expect(() => renderAd(0, 'uuid')).rejects.toThrow();
					await expect(() => renderAd('.selector', () => { /* noOp */ })).rejects.toThrow();
					await expect(() => renderAd(() => { /* noOp */ }, 'uuid')).rejects.toThrow();
					await expect(() => renderAd('.selector', null)).rejects.toThrow();
					await expect(() => renderAd(null, 'uuid')).rejects.toThrow();
				});
			});

			describe('DOM manipulation', () => {
				it('should throw an Error when the target is not found', async () => {
					await expect(() => renderAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
				});

				it('should throw an Error when the token is not found', async () => {
					document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
					await expect(() => renderAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
				});
			});
		});
	});
});
