/* eslint-disable compat/compat */
import {
	getTarget,
	renderFrame,
} from '../../src/render/utils.js';

describe('Render', () => {
	describe('Utils', () => {
		describe('getTarget', () => {
			it('should get the target element', () => {
				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
				const target = getTarget('#ad-slot-1');
				expect(target.innerHTML).toEqual('<iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe>');
				expect(target.id).toEqual('ad-slot-1');
			});
		});

		describe('renderFrame', () => {
			it('should render an iframe', () => {
				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"></div>';
				const target = getTarget('#ad-slot-1');
				renderFrame(target, { id: 'mock', bid: { render: 'http://example.com' } });
				expect(target.innerHTML).toEqual('<iframe id="fledge-auction-mock" src="http://example.com" scrolling="no" style="border-width: 0px;"></iframe>');
				expect(target.id).toEqual('ad-slot-1');
			});
		});
	});
});
