require('dotenv').config();
const COMMAND = require('./asset/Command');
const csvJSON = require('./JadwalToJSON');
const descCMD = require('./asset/CommandDescription.js');
const { Client, Intents, Formatters, MessageEmbed } = require('discord.js');
const fs = require('fs');
const csv = require('@fast-csv/parse');
const axios = require('axios');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['CHANNEL', 'MESSAGE'],
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!\n==================================`);
});

client.on('messageCreate', async (msg) => {

	const rawInput = msg.content.toLowerCase();

	let splitInput = rawInput.split(' ');
	splitInput = rejoin(splitInput);
	const cm = splitInput['cm'];
	const theParam = splitInput['param'];

	messagefrom(msg.author.username, cm, theParam);

	const embeded = new MessageEmbed();
	const temp = [];
	let jadwal = null;
	let newParam = null;
	let arrJadwal = [];
	let isDay = true;
	let myRole = null;
	// const callerName = null;
	// const isARole = null;

	// const allRole = await csvJSON.getAllRole(msg.guild.roles);

	switch (cm) {

	/* case command(COMMAND.ABSEN):
		myRole = msg.guild.roles.cache.find(role => role.name === 'a');
		await msg.channel.send(`Terima kasih anda sudah absen! ${Formatters.userMention(msg.author.id)}`);
		// await msg.channel.send(Formatters.roleMention(myRole.id));
		// console.log(msg.author.tag);


		isARole = msg.guild.members.cache.find(member => member.id === msg.author.id)
			.roles.cache.some(value => value.id === myRole.id);

		callerName = msg.guild.members.cache.find(member => member.id === msg.author.id).displayName;
		callerName = callerName.split('-').map(res => res.trim());

		console.log(callerName);
		console.log(isARole);

		break; */

	case command(COMMAND.JADWAL):

		// msg.guild.roles.cache.forEach(role => {
		// 	console.log(role);
		// });
		// console.log(myRole);
		// msg.guild.members.guild.roles.cache.forEach(r => {
		// 	console.log(r);
		// });
		// const m = msg.
		// es.cache.filter(roles => roles.id !== msg.guild.id).map(role => role.toString());
		// console.log(myRole);
		// console.log(msg.author);
		// myRole = msg.guild.roles.cache.find(role => role.id === 'a');
		// const role = msg.guild.roles.cache.find(role => role.name === "role name");


		if (theParam == null) {
			await msg.channel.send(`Command Error!\nShould be \`${command('jadwal [all]/[specified day]')}\`!`);
			break;
		}

		msg.member.roles.cache.forEach(item => console.log(item.id !== msg.guild.id ? item.name : ''));

		try {
			arrJadwal = await readJadwal('jadwal');
		}
		catch (e) {
			console.error(e);
		}
		jadwal = csvJSON.convertToJSON(arrJadwal);

		embeded.setColor('#95CD41');
		embeded.setTitle('Schedule Page');
		embeded.setTimestamp();
		embeded.setAuthor(client.user.username, client.user.avatarURL(), null);

		if (theParam === 'all') {
			embeded.setDescription('Here is schedule from Monday to Sunday.');
			for (const i in jadwal) {
				if (Object.hasOwnProperty.call(jadwal, i)) {
					printJadwal(jadwal, i, embeded);
				}
			}
		}
		else {
			for (const jKey in jadwal) {
				if (jKey === theParam) {
					embeded.setDescription(`Here is schedule in ${titleCase(jKey)}.`);
					printJadwal(jadwal, jKey, embeded);
					break;
				}
				else {
					isDay = false;
				}
			}
		}
		if (!isDay) {
			embeded.addField(titleCase('Warning!'), Formatters.blockQuote('Nama hari tidak sesuai!'), true);
		}
		await msg.reply({ embeds : [embeded] });
		embeded.setFields([]);
		break;

	case command(COMMAND.HELP):
		if (theParam != null) {
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
				if (element !== COMMAND.PREFIX) {
					for (const key in descCMD) {
						if (key.replace('DESC_', '') === i) {
							temp.push({
								name: titleCase('command ' + i.replace('_', ' ')),
								value: command(element) + ` ${descCMD[key]}`,
								inline: true,
							});
							break;
						}
					}
				}
			}
		}
		embeded.addFields(temp);
		await msg.channel.send({ embeds: [embeded] });

		temp.length = 0;
		embeded.setFields([]);
		break;

	case command(COMMAND.SET_REMINDER):
		if (theParam == null) {
			await msg.channel.send(`Command Error!\nShould be \`${command('setreminder [nama];[tanggal];[jam];[keterangan]')}\`!`);
			break;
		}

		newParam = theParam.replace(/[;[\]']/g, ' ')
			.replace(/\s\s+/g, ' ')
			.trim()
			.split(' ');

		await msg.channel.send(newParam.join(' '));
		/* client.on('interactionCreate', async interaction => {
			const message = await interaction.reply('You can react with Unicode emojis!', { fetchReply: true });
			await message.react('😄');
		}); */

		break;
	case command(COMMAND.UPLOAD_JADWAL):
		if (msg.attachments.size === 0) {
			await msg.channel.send('File tidak tersedia!');
			break;
		}

		for (const key of msg.attachments) {
			const url = key[1].url;
			axios.get(url)
				.then(res => {
					let roleSearch = null;
					const stream = csv.parse()
						.on('error', error => {
							console.error(error);
						})
						.on('data', row => {
							const filtered = row.filter(data => data);
							if (filtered.length === 0) return;
							if (!filtered.map(item => item.toUpperCase()).includes('ROLE DISCORD')) return;
							roleSearch = filtered.pop();
						})
						.on('end', () => {
							myRole = msg.guild.roles.cache.find(role => role.name === roleSearch);
							downloadFile(url, `./res/jadwal/${myRole.id}.csv`);
							msg.channel.send('File jadwal berhasil ditambahkan!');
						});
					stream.write(res.data);
					stream.end();
				})
				.catch(err => {
					console.error(err);
				});
		}

		break;

	case command('q'):
		await msg.author.send('cok');
		break;
	case command('cok'):
		// console.log(arrJadwal);
		// console.log(msg.author);
		// myRole = msg.guild.roles.cache.find(role => role.id === '923815115667697724');
		// console.log(myRole);
		// msg.guild.roles.cache.forEach(item => console.log(item.id + ' - ' + item.name));

		/* const tes = await msg.reply((Math.floor(Math.random() * 100) + 1).toString());
		await tes.react('🥲');
		await msg.channel.send('<a:GIGACHAD:852778674688360478>');
		await msg.channel.send('<a:PUTIN1:856846144935165973> '); */

		// console.log(tes.reactions.cache.get('👍'));
		// const s = await client.channels.cache.get('834367348977696821').messages.fetch('993908856826638357');
		// console.log(s.reactions.cache);
		// client.channels.cache.get('834367348977696821').messages.fetch('993858479796273172').then(m => {
		// 	const totalReactionsCount = m.reactions.cache.map(reaction => reaction.count).reduce(function(tot, arr) {
		// 		return tot + arr;
		// 	}, 0);
		// 	console.log(totalReactionsCount);
		// });

		// const emojis = msg.guild.emojis.cache
		// 	.map((e) => `${e.name} : ${e}`)
		// 	.join('\n');

		// const emojis = msg.guild.emojis.cache
		// 	.map(e => ({ [e.name]: e }));
		// console.log(emojis);
		break;
	}
});

client.login(process.env.TOKEN);

const readJadwal = async (fileName) => {
	return new Promise((resolve, reject) => {
		const head = [];
		const stream = fs.createReadStream(`./res/jadwal/${fileName}.csv`);
		const read = csv.parseStream(stream);

		read.on('error', error => reject(error))
			.on('data', row => {
				const filtered = row.filter(data => data);
				if (filtered.length === 0) return;
				head.push(filtered);
			})
			.on('end', () => resolve(head));
	});
};

const downloadFile = async (fileUrl, outputLocationPath) => {
	const writer = fs.createWriteStream(outputLocationPath);

	return axios(
		{
			method: 'get',
			url: fileUrl,
			responseType: 'stream',
		},
	).then(response => {

		// ensure that the user can call `then()` only when the file has
		// been downloaded entirely.

		return new Promise((resolve, reject) => {
			response.data.pipe(writer);
			let error = null;
			writer.on('error', err => {
				error = err;
				writer.close();
				reject(err);
			});
			writer.on('close', () => {
				if (!error) {
					resolve(true);
				}
				// no need to call the reject here, as it will have been called in the
				// 'error' stream;
			});
		});
	});
};

const command = (cmd) => {
	return COMMAND.PREFIX + cmd;
};

const titleCase = (str) => {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
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

const printJadwal = (arrJadwal, key, embededpart) => {
	const e = arrJadwal[key];
	let strnew = '';
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
		embededpart.addField(titleCase(key), Formatters.blockQuote('Tidak ada jadwal!'), true);
	}
	else {
		embededpart.addField(titleCase(key), Formatters.blockQuote(strnew), true);
	}
};