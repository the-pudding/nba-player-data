all-players--bbr-concat:
	csvstack output/all-players/*.csv > output/all-players--bbr.csv

player-seasons-concat:
	csvstack output/player-seasons/*.csv > output/player-seasons--all.csv