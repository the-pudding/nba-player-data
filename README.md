# General NBA parsing
Filter to just NBA players (played in 76-77+)

## 1. Get all players from basketball-reference
* `npm run all-players--bbr`
* `make all-players--bbr-concat`

## 2. Download each player page so we can run scripts locally
* `npm run download-player-page`

## 3. Create overall player info
Join NBA and BBR, create all top level info (BBR is base)
* `npm run player-info`

## 4. Create season stats for each player
Basics, advanced, awards
* `npm run player-season`

# Super Team parsing

## Notes
For season year: BBR uses end year, NBA uses start year