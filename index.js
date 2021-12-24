require('dotenv').config();
const { Client, Intents, Formatters, MessageEmbed } = require('discord.js');
const fs = require('fs');

let comm = null;
let jadwal = null;

fs.readFile('command.json', 'utf8', (err, data) => {
	/* we'll not consider error handling for now */
	if (err) {throw err;}
	comm = JSON.parse(data);
});
fs.readFile('jadwal.json', 'utf8', (err, data) => {
	/* we'll not consider error handling for now */
	if (err) {throw err;}
	jadwal = JSON.parse(data);
});

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!\n`);
});

const embeded = new MessageEmbed();

client.on('messageCreate', async (msg) => {
	let temp = [];
	let strnew = null;
	let myRole = null;
	switch (msg.content.toLowerCase()) {
	case command(comm['absen']):
		myRole = msg.guild.roles.cache.find(role => role.name === 'a');
		// await msg.channel.send(`Terima kasih anda sudah absen! ${Formatters.userMention(msg.author.id)}`);
		await msg.channel.send(Formatters.roleMention(myRole.id));
		// await msg.channel.send(myRole);
		// console.log(msg.author.tag);
		console.log(myRole);
		break;
	case command(comm['jadwal']):
		embeded.setColor('#95CD41');
		embeded.setTitle('Schedule Page');
		embeded.setDescription('Here is your schedule from Monday to Sunday.');
		embeded.setTimestamp();
		embeded.setAuthor(client.user.username, client.user.avatarURL(), null);
		strnew = '';
		for (const i in jadwal) {
			if (Object.hasOwnProperty.call(jadwal, i)) {
				const e = jadwal[i];
				for (const j in e) {
					if (Object.hasOwnProperty.call(e, j)) {
						const element = e[j];
						for (const k in element) {
							if (Object.hasOwnProperty.call(element, k)) {
								const el = element[k];
								if (k == 'link') {
									strnew += titleCase(k) + ': ' + el + '\n';
								}
								else if (k == 'nama pelajaran') {
									strnew += Formatters.bold(titleCase(k + ': ' + el) + '\n');
								}
								else {
									strnew += titleCase(k + ': ' + el + '\n');
								}
							}
						}
						strnew += '\n';
					}
				}
				embeded.addField(titleCase(i), Formatters.blockQuote(strnew), true);
				strnew = '';
			}
		}
		await msg.channel.send({ embeds : [embeded] });
		break;
	case command(comm['help']):
		embeded.setColor('#0099ff');
		embeded.setTitle('Help Page');
		embeded.setDescription('Hey this is your personal asisstant and this is my help page.');
		embeded.setTimestamp();
		embeded.setAuthor(client.user.username, client.user.avatarURL(), null);
		for (const i in comm) {
			if (Object.hasOwnProperty.call(comm, i)) {
				const element = comm[i];
				temp.push({ name: titleCase('command ' + i), value: process.env.PREFIX + element, inline: true });
			}
		}
		embeded.addFields(temp);
		temp = [];
		await msg.channel.send({ embeds: [embeded] });
		break;
	}
});

client.login(process.env.TOKEN);

const command = (cmd) => {
	return process.env.PREFIX + cmd;
};

const titleCase = (str) => {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(' ');
};

