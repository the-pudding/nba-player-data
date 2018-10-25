import fs from 'fs';
import * as d3 from 'd3';
import request from 'request';
import cheerio from 'cheerio';
import shell from 'shelljs';

// end year
const MIN_YEAR = 1998;
const MAX_YEAR = +new Date().getFullYear();
const base = 'https://www.basketball-reference.com/awards/recruit_rankings_';

let year = MIN_YEAR;

function getInfo($, el) {
	const children = $(el).children();
	const rank = $(children[0])
		.text()
		.replace('T', '');
	const nameRaw = $(children[1]).text();

	const index = nameRaw.indexOf(' (');
	const name = nameRaw.substring(0, index > 0 ? index : nameRaw.length);
	const link = $(children[1])
		.find('a')
		.attr('href');
	const draft_year = $(children[2]).text();
	const draft_rd = $(children[3]).text();
	const draft_pk = $(children[4]).text();
	const college = $(children[5]).text();
	return {
		name,
		link,
		rank,
		draft_year,
		draft_rd,
		draft_pk,
		college,
		recruit_year: year
	};
}

function scrape() {
	const url = `${base}${year}.html`;
	const players = [];
	console.log(year);
	request(url, (err, response, body) => {
		const $ = cheerio.load(body);
		$('tbody tr')
			.not('.thead')
			.each((i, el) => {
				const info = getInfo($, el);
				players.push(info);
			});
		const output = d3.csvFormat(players);
		fs.writeFileSync(`./output/rsci/${year}.csv`, output);
		year += 1;
		if (year <= MAX_YEAR) scrape();
		else
			shell.exec('csvstack output/rsci/*.csv > output/rsci--bbr.csv', {
				silent: true
			});
	});
}

scrape();
