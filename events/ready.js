module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.user.setStatus('online');
		client.user.setActivity('Joseph Work', { type: 'WATCHING' });
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};