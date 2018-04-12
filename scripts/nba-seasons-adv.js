import fs from 'fs';
import nba from 'nba.js';
import * as d3 from 'd3';
import shell from 'shelljs';

// didn't have em before this year
const MIN_YEAR = 1996;
const MAX_YEAR = 2018;
let year = MIN_YEAR;

function getSeason(cb) {
	const a = year;
	const b = `${year + 1}`.substring(2);
	const season = `${a}-${b}`;
	console.log(season);
	nba.stats.playerGeneralStats(
		{ MeasureType: 'Advanced', seasonType: 'Regular Season', Season: season },
		(err, res) => {
			if (err) {
				console.error(err);
				cb();
			} else {
				const players = res.LeagueDashPlayerStats.map(d => ({ ...d, season }));
				const csv = d3.csvFormat(players);
				fs.writeFileSync(`./output/nba-seasons-adv/${season}.csv`, csv);
				cb();
			}
		}
	);
}

function next() {
	getSeason(() => {
		year++;
		if (year < MAX_YEAR) next();
		else {
			shell.exec(
				'csvstack output/nba-seasons-adv/*.csv > output/nba-seasons-adv--all.csv',
				{ silent: true }
			);
		}
	});
}

next(year);
