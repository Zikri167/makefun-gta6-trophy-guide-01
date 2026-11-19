# makefun-gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Zikri167/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Zikri167/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — a static, fully offline web app that tracks all 55 PlayStation 5 trophies for Grand Theft Auto VI. Every trophy shows its official name, description and grade as PlayStation publishes them, plus a guide written for this entry in our own words that names its sources. The checklist saves in your browser (localStorage) and can be exported to a file and imported back; filters cover story, missable, collectibles, activities and online; a spoiler setting hides story trophies until you earn them; and a five-stage roadmap leads to the Platinum — including the list's one missable trophy, Positive Mental Attitude, flagged so you do it as you go. Photos are never involved: the app is plain HTML, CSS and hand-written JavaScript under app/, loads nothing over the network, and uses no Rockstar artwork or logo.

## Run it

```sh
cd app && python3 -m http.server 8000
# open http://localhost:8000 in a desktop browser, tick trophies off, export your progress
MAKEFUN_OUTPUT_DIR=/tmp/trophy-out node ../main.ts
# main.ts copies app/ and screenshots/ to the output dir and writes dossier.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=63s6rw9w&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
