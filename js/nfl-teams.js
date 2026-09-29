Bolao.teams = [
  ['NE','New England Patriots','AFC','Leste'],
  ['BUF','Buffalo Bills','AFC','Leste'],
  ['MIA','Miami Dolphins','AFC','Leste'],
  ['NYJ','New York Jets','AFC','Leste'],
  ['DEN','Denver Broncos','AFC','Oeste'],
  ['KC','Kansas City Chiefs','AFC','Oeste'],
  ['LAC','Los Angeles Chargers','AFC','Oeste'],
  ['LV','Las Vegas Raiders','AFC','Oeste'],
  ['IND','Indianapolis Colts','AFC','Sul'],
  ['HOU','Houston Texans','AFC','Sul'],
  ['JAX','Jacksonville Jaguars','AFC','Sul'],
  ['TEN','Tennessee Titans','AFC','Sul'],
  ['BAL','Baltimore Ravens','AFC','Norte'],
  ['CLE','Cleveland Browns','AFC','Norte'],
  ['CIN','Cincinnati Bengals','AFC','Norte'],
  ['PIT','Pittsburgh Steelers','AFC','Norte'],
  ['DAL','Dallas Cowboys','NFC','Leste'],
  ['NYG','New York Giants','NFC','Leste'],
  ['PHI','Philadelphia Eagles','NFC','Leste'],
  ['WSH','Washington Commanders','NFC','Leste'],
  ['ARI','Arizona Cardinals','NFC','Oeste'],
  ['SF','San Francisco 49ers','NFC','Oeste'],
  ['LAR','Los Angeles Rams','NFC','Oeste'],
  ['SEA','Seattle Seahawks','NFC','Oeste'],
  ['ATL','Atlanta Falcons','NFC','Sul'],
  ['NO','New Orleans Saints','NFC','Sul'],
  ['TB','Tampa Bay Buccaneers','NFC','Sul'],
  ['CAR','Carolina Panthers','NFC','Sul'],
  ['CHI','Chicago Bears','NFC','Norte'],
  ['GB','Green Bay Packers','NFC','Norte'],
  ['DET','Detroit Lions','NFC','Norte'],
  ['MIN','Minnesota Vikings','NFC','Norte']
].map(item => ({
  abbr: item[0],
  name: item[1],
  conference: item[2],
  division: item[3],
  logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${item[0].toLowerCase()}.png`
}));

Bolao.teamByAbbr = abbreviation =>
  Bolao.teams.find(team => team.abbr === abbreviation) || null;

Bolao.teamOptions = (filter = {}, selected = '') =>
  '<option value="">Selecione</option>' +
  Bolao.teams
    .filter(team =>
      (!filter.conference || team.conference === filter.conference) &&
      (!filter.division || team.division === filter.division)
    )
    .map(team =>
      `<option value="${team.abbr}" ${team.abbr === selected ? 'selected' : ''}>${team.name}</option>`
    )
    .join('');
