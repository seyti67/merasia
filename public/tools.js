/* eslint-disable @typescript-eslint/no-unused-vars */
// a function that generates a random string
function generateRandomString(length) {
	let randomString = '';
	const randomNumber = Math.floor(Math.random() * 10);

	for (let i = 0; i < length + randomNumber; i++) {
		randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
	}

	return randomString;
}

// a function that reads cookies and parses them into an object
function readCookies() {
	const cookies = {};
	document.cookie.split('; ').forEach((cookie) => {
		const [key, value] = cookie.split('=');
		cookies[key] = value;
	});
	return cookies;
}
function writeCookie(name, value) {
	document.cookie = `${name}=${value}`;
}
