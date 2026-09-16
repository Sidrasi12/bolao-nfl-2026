Bolao.TeamRecordsV2 = {
  apply() {
    const games = Bolao.Predictions.games || [];
    const cards = document.querySelectorAll('#games .game-card');

    cards.forEach((card, index) => {
      const game = games[index];
      if (!game) return;

      const teams = card.querySelectorAll('.team');
      if (teams.length < 2) return;

      this.rebuild(teams[0], game.away, false);
      this.rebuild(teams[1], game.home, true);
    });
  },

  rebuild(element, team, home) {
    const image = element.querySelector('img')?.cloneNode(true);
    const info = document.createElement('span');
    const name = document.createElement('span');
    const record = document.createElement('span');

    element.classList.add('team-record-layout');
    element.classList.toggle('team-record-home', home);

    info.className = 'team-record-info-v2';
    name.className = 'team-record-name-v2';
    record.className = 'team-record-value-v2';

    name.textContent = team.name;
    record.textContent = `(${team.record || 'Recorde indisponível'})`;
    info.append(name, record);

    element.replaceChildren();

    if (home) {
      element.append(info);
      if (image) element.append(image);
    } else {
      if (image) element.append(image);
      element.append(info);
    }
  },

  start() {
    this.apply();

    const games = document.querySelector('#games');
    if (!games) return;

    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver(() => {
      requestAnimationFrame(() => this.apply());
    });

    this.observer.observe(games, {
      childList: true,
      subtree: true
    });
  }
};

const originalWeeklyForRecordsV2 = Bolao.Predictions.weekly.bind(Bolao.Predictions);

Bolao.Predictions.weekly = async function() {
  await originalWeeklyForRecordsV2();
  Bolao.TeamRecordsV2.start();
};
