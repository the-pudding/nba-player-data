# NBA Player Data
Generate CSVs for NBA player data from both basketball-reference.com (BBR) stats.nba.com (NBA). Just players since merger (1976-77+).

## Requirements
* [node version 8](https://nodejs.org/)
* [csvkit](https://csvkit.readthedocs.io/en/1.0.2/)

## Setup
* Clone repo
* Run `npm i`

## Usage

### 1. Get all players from BBR
* `npm run all-players--bbr`

### 2. Get all players from NBA
* `npm run all-players--nba`

### 3. Join NBA and BBR
* `npm run all-players--joined`

### 4. Download each player page so we can run scripts locally
* `npm run download-player-page`

### 5. Create season stats for each player 
* `npm run player-seasons`

### 5. Add advanced stat rankings for each season for each player
* `npm run player-seasons--rank`

## Notes
* For season year: BBR uses end year, NBA uses start year
* There are some players that cannot be programmatically joined 