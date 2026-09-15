Bolao.TeamRecords = {
  apply() {
    const games = Bolao.Predictions.games || [];
    const cards = document.querySelectorAll('#games .game-card');

    cards.forEach((card, index) => {
      const game = games[index];
      if (!game) return;

      const teams = card.querySelectorAll('.team');
      if (teams.length < 2) return;

      this.formatTeam(teams[0], game.away.name, game.away.record);
      this.formatTeam(teams[1], game.home.name, game.home.record);
    });
  },

  formatTeam(teamElement, teamName, record) {
    const image = teamElement.querySelector('img');
    let nameElement = teamElement.querySelector('.team-name');
    let recordElement = teamElement.querySelector('.team-record');

    if (!nameElement) {
      nameElement = document.createElement('span');
      nameElement.className = 'team-name';
    }

    if (!recordElement) {
      recordElement = document.createElement('small');
      recordElement.className = 'team-record';
    }

    nameElement.textContent = teamName;
    recordElement.textContent = `(${record || 'Recorde indisponível'})`;

    teamElement.replaceChildren();
    if (teamElement.matches('.team:last-child')) {
      teamElement.append(nameElement, recordElement);
      if (image) teamElement.append(image);
    } else {
      if (image) teamElement.append(image);
      teamElement.append(nameElement, recordElement);
    }
  }
};

const originalRenderGames = Bolao.Predictions.renderGames.bind(Bolao.Predictions);

Bolao.Predictions.renderGames = function(week) {
  const result = originalRenderGames(week);
  Bolao.TeamRecords.apply();
  return result;
};
