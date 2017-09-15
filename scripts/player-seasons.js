import fs from 'fs';
import * as d3 from 'd3';
import cheerio from 'cheerio';

const USE = {
	basic: [
		'Season',
		'Age',
		'Tm',
		'Lg',
		'G',
		'MP',
		'FG%',
		'3P%',
		'2P%',
		'eFG%',
		'FT%',
		'TRB',
		'AST',
		'STL',
		'BLK',
		'PTS',
	],
	advanced: ['Season', 'Tm', 'PER', 'WS', 'WS/48', 'BPM', 'VORP'],
};

const data = d3.csvParse(
	fs.readFileSync('./output/all-players--joined.csv', 'utf-8'),
);

function getValues($, tr, cols, bbrID) {
	const values = $(tr)
		.find('td,th')
		.map((i, td) => ({ index: i, value: $(td).text() }))
		.get();

	const colsIndex = cols.map(d => d.index);

	const filtered = values.filter(d => colsIndex.includes(d.index)).map(d => ({
		value: d.value,
		prop: cols.find(c => c.index === d.index).name,
	}));

	const season = { bbrID };

	filtered.forEach(d => {
		season[d.prop] = d.value;
	});

	return season;
}

function getSeasonStats(bbrID, html, table) {
	const $ = cheerio.load(html);
	const $table = $('table');
	const columnNames = $table
		.find('thead th')
		.map((i, el) =>
			$(el)
				.text()
				.trim(),
		)
		.get();

	const columns = columnNames.map((d, i) => ({ index: i, name: d }));
	const columnsFiltered = columns.filter(d => USE[table].includes(d.name));

	const $rows = $table.find('tbody tr');
	const seasons = [];
	$rows.each((i, tr) => seasons.push(getValues($, tr, columnsFiltered, bbrID)));

	return seasons;
}

function getAwardStats(html) {
	if (!html) return [];
	const $ = cheerio.load(html);
	const awards = $('#leaderboard_all_league tbody td')
		.map((i, el) => {
			const season = $(el)
				.find('a')
				.text()
				.trim();

			$(el)
				.find('a')
				.remove();
			const award = $(el)
				.text()
				.trim();
			return { Season: season, Award: award || '' };
		})
		.get();

	return awards.filter(
		d => !d.Award.includes('Defensive') && !d.Award.includes('Rookie'),
	);
}

function getAdvancedHTML($) {
	return $('#all_advanced')
		.contents()
		.map((i, node) => (node.type === 'comment' ? node.data : null))
		.get()[0];
}

function getAwardHTML($) {
	return $('#all_leaderboard')
		.contents()
		.map((i, node) => (node.type === 'comment' ? node.data : null))
		.get()[0];
}

function joinStats(basic, advanced, award) {
	const joined = basic.map(b => {
		const advancedMatch = advanced.find(
			a => a.Season === b.Season && a.Tm === b.Tm,
		);
		const awardMatch = award.find(w => w.Season === b.Season) || {};
		return {
			...b,
			...advancedMatch,
			Award: '',
			...awardMatch,
		};
	});

	// change team if TOT (they changed halway thru)
	const tots = joined.filter(d => d.Tm === 'TOT').map(d => d.Season);

	// remove actual teams
	const others = joined.filter(d => tots.includes(d.Season) && d.Tm !== 'TOT');
	const withoutDupes = joined.filter(
		d => !(tots.includes(d.Season) && d.Tm !== 'TOT'),
	);

	const withOthers = withoutDupes.map(d => ({
		...d,
		Tm:
			d.Tm === 'TOT'
				? others
					.filter(o => o.Season === d.Season)
					.map(s => s.Tm)
					.join(',')
				: d.Tm,
	}));

	return withOthers;
}

function getSeasons(player, i) {
	console.log(d3.format('.1%')(i / data.length));
	const file = fs.readFileSync(
		`./output/player-pages/${player.bbrID}.html`,
		'utf-8',
	);
	const $ = cheerio.load(file);

	const basic = $.html('#all_per_game');
	const basicStats = getSeasonStats(player.bbrID, basic, 'basic');

	// SUPER hacky to convert comments into html but it works
	const advanced = getAdvancedHTML($);
	const advancedStats = getSeasonStats(player.bbrID, advanced, 'advanced');

	// SUPER hacky to convert comments into html but it works
	const awards = getAwardHTML($);
	const awardStats = getAwardStats(awards);

	const joinedStats = joinStats(basicStats, advancedStats, awardStats);
	const csv = d3.csvFormat(joinedStats);
	fs.writeFileSync(`./output/player-seasons/${player.bbrID}.csv`, csv);
}

data.forEach(getSeasons);
