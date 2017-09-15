import fs from 'fs';
import * as d3 from 'd3';

const MIN_MP_DEFAULT = 1500;
const MIN_MP_SPECIAL = {
	'1998-99': 915,
	'2011-12': 1207,
};

const ADV_STATS = ['PER', 'WS', 'WS/48', 'BPM', 'VORP'];

const data = d3.csvParse(
	fs.readFileSync('./output/player-seasons--all.csv', 'utf-8'),
);

function getRankedSeasons(stat) {
	const copy = data.map(d => ({ ...d }));
	const nested = d3
		.nest()
		.key(d => d.Season)
		.sortValues((a, b) => {
			const aM = +a.G * +a.MP;
			const bM = +b.G * +b.MP;
			const min = MIN_MP_SPECIAL[a.Season] || MIN_MP_DEFAULT;
			const aV = aM >= min ? +a[stat] : -9999;
			const bV = bM >= min ? +b[stat] : -9999;
			return d3.descending(aV, bV);
		})
		.entries(copy);

	// add rank as col
	const ranked = nested.map(season => {
		season.values.forEach((d, i) => (d[`${stat}_rank`] = i));
		return season.values;
	});

	return [].concat(...ranked);
}

const rankedStats = ADV_STATS.map(getRankedSeasons);

console.log(rankedStats[0].shift());

// data.forEach((d, index) => {
// 	console.log(d3.format('.1%')(index / data.length));
// 	ADV_STATS.forEach((stat, i) => {
// 		const match = rankedStats[i].find(
// 			s => s.bbrID === d.bbrID && s.Season === d.Season,
// 		);
// 		const rankStat = `${stat}_rank`;
// 		d[rankStat] = match[rankStat];
// 	});
// });

// const csv = d3.csvFormat(data);
// fs.writeFileSync('./output/player-seasons--rank.csv', csv);
