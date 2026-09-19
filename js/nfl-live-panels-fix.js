Bolao.NFLLivePanelsFix = {
  capture() {
    const panels = new Map();
    document.querySelectorAll('#games .game-card').forEach(card => {
      const gameId = card.querySelector('.choice[data-g]')?.dataset.g;
      const panel = card.querySelector('.live-enhancement');
      if (gameId && panel) panels.set(gameId, panel.innerHTML);
    });
    return panels;
  },

  restore(panels) {
    if (!panels.size) return;
    document.querySelectorAll('#games .game-card').forEach(card => {
      const gameId = card.querySelector('.choice[data-g]')?.dataset.g;
      const html = gameId ? panels.get(gameId) : null;
      if (!html) return;

      let panel = card.querySelector('.live-enhancement');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'live-enhancement';
        card.appendChild(panel);
      }
      panel.innerHTML = html;
    });
  }
};

const nflPanelsPreviousRenderGames =
  Bolao.Predictions.renderGames.bind(Bolao.Predictions);

Bolao.Predictions.renderGames = function(week) {
  const panels = Bolao.NFLLivePanelsFix.capture();
  const result = nflPanelsPreviousRenderGames(week);
  Bolao.NFLLivePanelsFix.restore(panels);
  return result;
};
