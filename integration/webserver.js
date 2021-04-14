import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// set the port
app.set('port', 3000);

// tell express that we want to use the www folder
// for our static assets
app.use(express.static(path.join(__dirname, 'www')));

// Listen for requests
app.listen(app.get('port'), () => {
	// eslint-disable-next-line no-console
	console.log(`The server is running on http://localhost:${app.get('port')}`);
});
