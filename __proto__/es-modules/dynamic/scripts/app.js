const name = "tag";
const suffix = "js";
const filename = `./${name}.${suffix}`;

import(filename).then(({ tag }) => {
	const h1 = tag('h1', '👋 Hello Modules!');
	document.body.appendChild(h1);
});
