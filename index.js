require('dotenv').config();
const COMMAND = require('./asset/Command');
const csvJSON = require('./JadwalToJSON');
const { Client, Intents, Formatters, MessageEmbed } = require('discord.js');
const fs = require('fs');
const csv = require('@fast-csv/parse');

let jadwal = null;
const head = [];

const stream = fs.createReadStream('asset/jadwal.csv');
const readJadwal = csv.parseStream(stream);

readJadwal.on('error', error => console.error(error))
	.on('data', row => {
		const filtered = row.filter(data => data);
		if (filtered.length === 0) return;
		head.push(filtered);
	})
	.on('end', rowCount => {
		console.log(`Parsed ${rowCount} rows`);
	});

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!\n==================================`);
});

const embeded = new MessageEmbed();

client.on('messageCreate', async (msg) => {


	const rawinput = msg.content.toLowerCase();

	let splittedinput = rawinput.split(' ');
	splittedinput = rejoin(splittedinput);
	const cm = splittedinput['cm'];
	const theparam = splittedinput['param'];

	messagefrom(msg.author.username, cm, theparam);

	const temp = [];
	let strnew = null;
	let myRole = null;
	let callerName = null;
	let newParam = null;

	csvJSON.getAllRole(msg.guild.roles);

	switch (cm) {

	case command(COMMAND.ABSEN):
		myRole = msg.guild.roles.cache.find(role => role.name === 'a');
		await msg.channel.send(`Terima kasih anda sudah absen! ${Formatters.userMention(msg.author.id)}`);
		// await msg.channel.send(Formatters.roleMention(myRole.id));
		// console.log(msg.author.tag);

		callerName = msg.guild.members.cache.find(member => member.id === msg.author.id).displayName;
		callerName = callerName.split('-').map(res => res.trim());
		// console.log(callerName);

		break;

	case command(COMMAND.JADWAL):
		jadwal = csvJSON.convertToJSON(head);

		embeded.setColor('#95CD41');
		embeded.setTitle('Schedule Page');
		embeded.setDescription('Here is schedule from Monday to Sunday.');
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
								if (k.toLowerCase() === 'link') {
									strnew += titleCase(k) + ': ' + el.toLowerCase() + '\n';
								}
								else if (k.toLowerCase() === 'nama pelajaran') {
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
				if (strnew === '') {
					embeded.addField(titleCase(i), Formatters.blockQuote('Tidak ada jadwal!'), true);
				}
				else {
					embeded.addField(titleCase(i), Formatters.blockQuote(strnew), true);
				}
				strnew = '';
			}
		}
		await msg.reply({ embeds : [embeded] });
		embeded.setFields([]);
		break;

	case command(COMMAND.HELP):
		if (theparam != null) {
			await msg.channel.send('Invalid command!');
			break;
		}
		embeded.setColor('#0099ff');
		embeded.setTitle('Help Page');
		embeded.setDescription('Hey this is your personal asisstant and this is my help page.');
		embeded.setTimestamp();
		embeded.setAuthor(client.user.username, client.user.avatarURL(), null);
		for (const i in COMMAND) {
			if (Object.hasOwnProperty.call(COMMAND, i)) {
				const element = COMMAND[i];
				if (element !== COMMAND.PREFIX) temp.push({ name: titleCase('command ' + i.replace('_', ' ')), value: command(element), inline: true });
			}
		}
		embeded.addFields(temp);
		temp.length = 0;
		await msg.channel.send({ embeds: [embeded] });
		break;

	case command(COMMAND.SET_REMINDER):
		if (theparam == null) {
			await msg.channel.send(`Command Error!\nShould be \`${command('setreminder [nama];[tanggal];[jam];[keterangan]')}\`!`);
			break;
		}
		newParam = theparam.replace(/[;[\]']/g, ' ');
		newParam = newParam.replace(/\s\s+/g, ' ');
		newParam = newParam.trim();
		newParam = newParam.split(' ');

		await msg.channel.send(newParam.join(' '));
		/* client.on('interactionCreate', async interaction => {
			const message = await interaction.reply('You can react with Unicode emojis!', { fetchReply: true });
			message.react('😄');
		}); */

		break;

	case command('cok'):
		console.log(head);
		break;
	case command('q'):

		break;
	}

});

client.login(process.env.TOKEN);

const command = (cmd) => {
	return COMMAND.PREFIX + cmd;
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

const rejoin = (array_of_command) => {
	try {
		if (array_of_command.length === 1) {
			return { cm: array_of_command[0], param: null };
		}
		else {
			return { cm: array_of_command[0], param: array_of_command.slice(1).join(' ') };
		}
	}
	catch (e) {
		console.error(e);
	}
};

const messagefrom = (senders, cm, theparam) => {
	if (senders !== 'MasterEgg\'s Bot') {
		console.log({ sender: senders, command: cm, parameter: theparam });
	}
	else {
		console.log({ status: 'Successfully replied!' });
	}
};

const convertToDate = (theDate) => {
	const newdate = new Date(theDate);
	return {
		tanggal: newdate.getDate(),
		bulan: newdate.getMonth(),
		tahun: newdate.getFullYear(),
		jam: newdate.getHours(),
		menit: newdate.getMinutes(),
		detik: newdate.getSeconds(),
	};
};
