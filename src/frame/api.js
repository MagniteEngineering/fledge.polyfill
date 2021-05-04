import runAdAuction from './auction/index.js';
import joinAdInterestGroup from './interest-groups/join.js';
import leaveAdInterestGroup from './interest-groups/leave.js';
import renderAd from './render/index.js';

export default async function fledgeAPI ({ data, ports }) {
	try {
		if (!Array.isArray(data)) {
			throw new Error('data is not what it should be');
		}

		switch (data[0]) {
			case 'joinAdInterestGroup': {
				const [ , request ] = data;
				const [ options, expiry ] = request;

				await joinAdInterestGroup(options, expiry);

				return;
			}
			case 'leaveAdInterestGroup': {
				const [ , request ] = data;
				const [ group ] = request;

				await leaveAdInterestGroup(group);

				return;
			}
			case 'runAdAuction': {
				const [ , request ] = data;
				const [ conf ] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [ port ] = ports;
				const token = await runAdAuction(conf);
				const response = [ true, token ];
				port.postMessage(response);
				port.close();

				return;
			}
			case 'renderAd': {
				const [ , request ] = data;
				const [ selector, token ] = request;

				await renderAd(selector, token);

				return;
			}
			default: {
				return false;
			}
		}
	} catch (error) {
		const response = [ false ];
		for (const port of ports) {
			port.postMessage(response);
		}
		throw error;
	}
}
