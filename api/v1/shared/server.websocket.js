const path = require('path');
const db = require(path.join(__dirname, '../shared/db'));

module.exports = {
	createMessage
}

async function createMessage(content, isBroadcast = false, sender = 'NS') {
    return await JSON.stringify({
		'content': content,
		'isBroadcast': isBroadcast,
		'sender': sender
	});
}
