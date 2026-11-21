Bolao.FavoriteTeamRanking = {
  users: new Map(),

  async loadUsers() {
    const snapshot = await Bolao.db.collection('users').get();
    this.users = new Map(snapshot.docs.map(document => [
      document.id,
      { uid: document.id, ...document.data() }
    ]));
  },

  logoHtml(userId) {
    const user = this.users.get(userId);
    const abbr = typeof user?.favoriteTeam === 'string' ? user.favoriteTeam.trim() : '';
    if (!abbr) return '';

    const team = Bolao.teamByAbbr?.(abbr);
    if (!team || !team.logo) return '';

    return `<img class="ranking-team-logo" src="${team.logo}" alt="${team.name || abbr}" title="${team.name || abbr}">`;
  },

  decorate(rows) {
    const bodyRows = Array.from(document.querySelectorAll('#ranking tbody tr'));
    let participantIndex = 0;

    bodyRows.forEach(tableRow => {
      const isGabarito =
        tableRow.matches('.gabarito-row, [data-is-gabarito="true"]') ||
        /gabarito oficial/i.test(tableRow.textContent || '');

      if (isGabarito) return;

      const row = rows[participantIndex];
      participantIndex += 1;

      const nameCell = tableRow.children[1];
      if (!row || !nameCell) return;

      const existingLogo = nameCell.querySelector('.ranking-team-logo');
      if (existingLogo) existingLogo.remove();

      const logo = this.logoHtml(row.uid);
      if (!logo) return;

      const innerText = nameCell.innerHTML;
      nameCell.innerHTML = `<span class="ranking-participant">${logo}<span>${innerText}</span></span>`;
    });
  }
};

const favoriteTeamPreviousRankingLoad = Bolao.Ranking.load.bind(Bolao.Ranking);

Bolao.Ranking.load = async function(mode) {
  await Bolao.FavoriteTeamRanking.loadUsers();
  await favoriteTeamPreviousRankingLoad(mode);

  const source = await Bolao.Ranking.source();
  let rows;

  if (mode === 'preseason' && typeof Bolao.Ranking.loadPreseasonMatrix === 'function') {
    const matrixData = await Bolao.Ranking.loadPreseasonMatrix(source.users);
    rows = matrixData.rows || [];
  } else {
    rows = Bolao.Ranking.rows(source.users, source.scores, mode)
      .sort((first, second) => Bolao.Finance.compare(first, second));
  }

  Bolao.FavoriteTeamRanking.decorate(rows);
};
