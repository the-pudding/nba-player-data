import fs from 'fs';
import * as d3 from 'd3';

const dataBBR = d3.csvParse(
	fs.readFileSync('./output/all-players--bbr.csv', 'utf-8'),
);
const dataNBA = d3.csvParse(
	fs.readFileSync('./output/all-players--nba.csv', 'utf-8'),
);
const dataManual = d3.csvParse(
	fs.readFileSync('./input/no-nba-match--manual.csv', 'utf-8'),
);

function cleanName(str) {
	return str
		.replace(' Jr.', '')
		.replace(/\W/g, '')
		.toLowerCase()
		.trim();
}

function getNBAMatch(datum, bbrID) {
	const filtered = dataNBA.filter(
		d => cleanName(d.display_first_last) === cleanName(datum.name),
	);

	if (filtered.length > 1) {
		// make sure they aren't the same exact year
		const same = filtered.every(d => +d.from_year === +datum.year_from);
		if (same) return null;
		return filtered.find(d => +d.from_year === +datum.year_from - 1);
	} else if (filtered.length) return filtered[0];

	// back up plan, check manual data
	const match = dataManual.find(d => d.bbrID === bbrID && d.nbaID);
	return match ? dataNBA.find(d => d.person_id === match.nbaID) : null;
}

function getNBAInfo(datum) {
	const name = datum.display_last_comma_first;
	const sep = name.includes(',') ? ',' : ' ';
	const split = name.split(sep);
	const first = split.length > 1 ? split[1].trim() : null;
	const last = split[0].trim();
	const nbaID = datum.person_id;
	return { first, last, nbaID };
}

const noMatch = [];
const output = dataBBR.map((d, i) => {
	const tempID = d.link.replace('/players/', '').replace('.html', '');
	const bbrID = tempID.split('/')[1];
	const nbaMatch = getNBAMatch(d, bbrID);
	if (nbaMatch) {
		const { first, last, nbaID } = getNBAInfo(nbaMatch);
		return { ...d, first, last, nbaID, bbrID };
	}
	noMatch.push({ bbrID, link: d.link });
	return { ...d, bbrID };
});

const csv = d3.csvFormat(output);
fs.writeFileSync('./output/all-players--joined.csv', csv);

const noMatchCsv = d3.csvFormat(noMatch.map(d => ({ bbrID: d.bbrID })));
fs.writeFileSync('./output/no-nba-match.csv', noMatchCsv);
