import fs from 'fs';
import * as d3 from 'd3';

const MIN_MP_DEFAULT = 1500;
const MIN_MP_SPECIAL = {
	'1998-99': 915,
	'2011-12': 1207,
};

const ADV_STATS_BBR = ['PER', 'WS', 'WS/48', 'BPM', 'VORP'];
const ADV_STATS_NBA = ['net_rating', 'pie'];

const dataBBR = d3.csvParse(
	fs.readFileSync('./output/player-seasons--all.csv', 'utf-8'),
);

const dataNBA = d3.csvParse(
	fs.readFileSync('./output/nba-seasons-adv--all.csv', 'utf-8'),
);

const playerLookup = d3.csvParse(
	fs.readFileSync('./output/all-players--joined.csv', 'utf-8'),
);

function getRankedBBR(stat) {
	const copy = dataBBR.map(d => ({ ...d }));
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

function getRankedNBA(stat) {
	const copy = dataNBA.map(d => ({ ...d }));
	const nested = d3
		.nest()
		.key(d => d.season)
		.sortValues((a, b) => {
			const aM = +a.gp * +a.min;
			const bM = +b.gp * +b.min;
			const min = MIN_MP_SPECIAL[a.season] || MIN_MP_DEFAULT;
			const aV = aM >= min ? +a[stat] : -9999;
			const bV = bM >= min ? +b[stat] : -9999;
			return d3.descending(aV, bV);
		})
		.entries(copy);

	// add rank as col
	const ranked = nested.map(season => {
		season.values.forEach((d, i) => (d[`${stat}_rank2`] = i));
		return season.values;
	});

	return [].concat(...ranked);
}

const rankedStatsBBR = ADV_STATS_BBR.map(getRankedBBR);
const rankedStatsNBA = ADV_STATS_NBA.map(getRankedNBA);

dataBBR.forEach((d, index) => {
	console.log(d3.format('.1%')(index / dataBBR.length));
	// BBR
	ADV_STATS_BBR.forEach((stat, i) => {
		const match = rankedStatsBBR[i].find(
			s => s.bbrID === d.bbrID && s.Season === d.Season,
		);
		const rankStat = `${stat}_rank`;
		d[rankStat] = match[rankStat];
	});

	// NBA
	const { nbaID } = playerLookup.find(p => p.bbrID === d.bbrID);
	ADV_STATS_NBA.forEach((stat, i) => {
		const match = rankedStatsNBA[i].find(
			s => s.player_id === nbaID && s.season === d.Season,
		);

		const rankStat = `${stat}_rank2`;
		d[rankStat] = match ? match[rankStat] : null;
	});
});

const csv = d3.csvFormat(dataBBR);
fs.writeFileSync('./output/player-seasons--rank.csv', csv);
