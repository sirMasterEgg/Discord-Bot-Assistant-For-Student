const getAllRole = async (roles) => {
	const allRole = [];
	try {
		const r = await roles.fetch();
		r.each(user => {
			allRole.push({ id: user.id, name: user.name });
		});
		return allRole;
	}
	catch (e) {
		console.error(e);
	}
};

const convertToJSON = (csv_spliited_array) => {
	const csvData = csv_spliited_array.splice(2);

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