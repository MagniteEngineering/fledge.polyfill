export function tag (tag, text) {
	const el = document.createElement(tag);
	el.textContent = text;

	return el;
}
