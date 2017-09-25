import fs from 'fs';
import * as d3 from 'd3';

import shell from 'shelljs';

const ACTIVE = process.argv.length > 2 && process.argv[2].trim() === 'active';

const data = d3.csvParse(
	fs.readFileSync('./output/all-players--bbr.csv', 'utf-8'),
);

const filtered = data.filter(d => (ACTIVE ? d.active : true));

const base = 'https://www.basketball-reference.com';
filtered.forEach((d, i) => {
	console.log(d3.format('.1%')(i / filtered.length));
	const url = `${base}${d.link}`;
	shell.exec(`cd output/player-pages/; curl -O ${url}`, { silent: true });
});
