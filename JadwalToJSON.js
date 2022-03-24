const allRole = [];
const getAllRole = (roles) => {
	roles.fetch()
		.then(role => role.each(user => {
			allRole.push({ id: user.id, name: user.name });
			// console.log(user.id, user.name);
		}))
		.catch(console.error);
};

const convertToJSON = (csv_spliited_array) => {
	const roleHeader = csv_spliited_array[0].splice(2);
	const csvHeader = csv_spliited_array[1];
	const csvData = csv_spliited_array.splice(2);
	const listDay = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

	const jadwal = {
		senin : [],
		selasa : [],
		rabu : [],
		kamis : [],
		jumat : [],
		sabtu : [],
		minggu : [],
	};

	for (const i in jadwal) {
		for (const j in csvData) {
			if (csvData[j][0].toLowerCase() === i) {
				const newCsvData = csvData[j].splice(1);
				/* const newCsvKey = csvHeader.splice(1); */
				const posted = {};

				posted['Nama Pelajaran'] = newCsvData[0];
				posted['Waktu'] = newCsvData[1];
				posted['Durasi'] = newCsvData[2];
				posted['Pengajar'] = newCsvData[3];
				posted['Link'] = newCsvData[4];
				posted['Note'] = newCsvData[5];

				jadwal[i].push(posted);
			}
		}
	}

	return jadwal;
};

module.exports = { convertToJSON, getAllRole };