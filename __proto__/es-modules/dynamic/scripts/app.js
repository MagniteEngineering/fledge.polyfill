const name = "tag";
const suffix = "js";
const host = 'https://cdn.jsdelivr.net/gh/iamnewton/es-module-dynamics';
const filename = `${host}/${name}.${suffix}`;

import(filename).then(({ tag }) => {
	const h1 = tag('h1', '👋 Hello Modules!');
	document.body.appendChild(h1);
});
