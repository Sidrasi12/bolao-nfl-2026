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
    const team = Bolao.teamByAbbr(user?.favoriteTeam);
    if (!team) return '';

    return `<img class="ranking-team-logo" src="${team.logo}"
      alt="" title="${team.name}">`;
  },

  decorate(rows) {
    const bodyRows = document.querySelectorAll('#ranking tbody tr');

    bodyRows.forEach((tableRow, index) => {
      const row = rows[index];
      const nameCell = tableRow.children[1];
      if (!row || !nameCell || nameCell.querySelector('.ranking-team-logo')) return;

      const logo = this.logoHtml(row.uid);
      if (!logo) return;

      nameCell.innerHTML = `<span class="ranking-participant">${logo}<span>${nameCell.innerHTML}</span></span>`;
    });
  }
};

const favoriteTeamPreviousRankingLoad = Bolao.Ranking.load.bind(Bolao.Ranking);

Bolao.Ranking.load = async function(mode) {
  await Bolao.FavoriteTeamRanking.loadUsers();
  await favoriteTeamPreviousRankingLoad(mode);

  const source = await Bolao.Ranking.source();
  const rows = Bolao.Ranking.rows(source.users, source.scores, mode)
    .sort((first, second) => Bolao.Finance.compare(first, second));

  Bolao.FavoriteTeamRanking.decorate(rows);
};
