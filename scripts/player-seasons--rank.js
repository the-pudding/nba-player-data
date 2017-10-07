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
	const copy = dataBBR.map(d => ({ ...d })).map(d => {
		const minutes = +d.G * +d.MP;
		const threshold = MIN_MP_SPECIAL[d.Season] || MIN_MP_DEFAULT;
		const statValue = minutes >= threshold ? +d[stat] : -9999;
		return {
			...d,
			[[`${stat}_value`]]: statValue,
		};
	});

	const nested = d3
		.nest()
		.key(d => d.Season)
		.sortValues((a, b) => d3.descending(a[`${stat}_value`], b[`${stat}_value`]))
		.entries(copy);

	// add rank as col
	const ranked = nested.map(season => {
		const justValues = season.values.map(v => v[`${stat}_value`]);
		// season.values.forEach((d, i) => (d[`${stat}_rank`] = i));
		season.values.forEach(d => {
			const rank = justValues.indexOf(d[`${stat}_value`]);
			d[`${stat}_rank`] = rank;
		});
		return season.values;
	});

	return [].concat(...ranked);
}

function getRankedNBA(stat) {
	const copy = dataNBA.map(d => ({ ...d })).map(d => {
		const minutes = +d.gp * +d.min;
		const threshold = MIN_MP_SPECIAL[d.season] || MIN_MP_DEFAULT;
		const statValue = minutes >= threshold ? +d[stat] : -9999;
		return {
			...d,
			[[`${stat}_value`]]: statValue,
		};
	});
	const nested = d3
		.nest()
		.key(d => d.season)
		.sortValues((a, b) => d3.descending(a[`${stat}_value`], b[`${stat}_value`]))
		.entries(copy);

	// add rank as col
	const ranked = nested.map(season => {
		const justValues = season.values.map(v => v[`${stat}_value`]);
		// season.values.forEach((d, i) => (d[`${stat}_rank`] = i));
		season.values.forEach(d => {
			const rank = justValues.indexOf(d[`${stat}_value`]);
			d[`${stat}_rank2`] = rank;
		});
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
		d[`${stat}_rank`] = match ? match[rankStat] : null;
		d[`${stat}`] = match ? match[stat] : null;
	});
});

const csv = d3.csvFormat(dataBBR);
fs.writeFileSync('./output/player-seasons--rank.csv', csv);
