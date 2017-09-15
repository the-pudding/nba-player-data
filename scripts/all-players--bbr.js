import fs from 'fs';
import * as d3 from 'd3';
import request from 'request';
import cheerio from 'cheerio';
import shell from 'shelljs';

// end year
const MIN_YEAR = 1977;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const base = 'https://www.basketball-reference.com/players';

let index = 0;

function getInfo($, el) {
	const children = $(el).children();
	const name = $(children[0])
		.text()
		.replace('*', '');
	const link = $(children[0])
		.find('a')
		.attr('href');
	const year_from = $(children[1]).text();
	const year_to = $(children[2]).text();
	const college = $(children[7]).text();
	return { name, link, year_from, year_to, college };
}

function scrape() {
	const letter = ALPHABET[index];
	const url = `${base}/${letter}/`;
	const players = [];
	console.log(d3.format('.1%')(index / ALPHABET.length));
	request(url, (err, response, body) => {
		const $ = cheerio.load(body);
		$('#all_players tbody tr').each((i, el) => {
			const info = getInfo($, el);
			if (+info.year_to >= MIN_YEAR) players.push(info);
		});
		const output = d3.csvFormat(players);
		fs.writeFileSync(`./output/all-players/${letter}.csv`, output);
		index++;
		if (index < ALPHABET.length) scrape();
	});
}

scrape();

shell.exec('csvstack output/all-players/*.csv > output/all-players--bbr.csv', {
	silent: true,
});
