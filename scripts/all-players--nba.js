import nba from 'nba.js';
import * as d3 from 'd3';
import fs from 'fs';
import uniq from 'lodash.uniqby';

// start year
const MIN_YEAR = 1976;

nba.stats.allPlayers({ IsOnlyCurrentSeason: 0 }, (err, res) => {
	if (err) console.error(err);
	else {
		const players = res.CommonAllPlayers;
		const filtered = players.filter(d => +d.to_year >= MIN_YEAR);
		const unique = uniq(filtered, d => d.person_id);
		const output = d3.csvFormat(unique);
		fs.writeFileSync('./output/all-players--nba.csv', output);
	}
});
