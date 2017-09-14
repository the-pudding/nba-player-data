import fs from 'fs';
import * as d3 from 'd3';
import request from 'request';

import shell from 'shelljs';

const data = d3.csvParse(
	fs.readFileSync('./output/all-players--bbr.csv', 'utf-8'),
);

const base = 'https://www.basketball-reference.com';
data.forEach((d, i) => {
	console.log(`${i} of ${data.length}`);
	const url = `${base}${d.link}`;
	shell.exec(`cd output/player-pages/; curl -O ${url}`, { silent: true });
});
