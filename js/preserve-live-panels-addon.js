Bolao.PreserveLivePanels = {
  capture() {
    const content = new Map();

    document.querySelectorAll('#games .game-card').forEach(card => {
      const gameId = card.querySelector('.choice[data-g]')?.dataset.g;
      const liveBox = card.querySelector('.live-enhancement');

      if (gameId && liveBox) {
        content.set(gameId, liveBox.innerHTML);
      }
    });

    return content;
  },

  restore(content) {
    if (!content?.size) return;

    document.querySelectorAll('#games .game-card').forEach(card => {
      const gameId = card.querySelector('.choice[data-g]')?.dataset.g;
      const savedContent = gameId ? content.get(gameId) : null;

      if (!savedContent) return;

      let liveBox = card.querySelector('.live-enhancement');
      if (!liveBox) {
        liveBox = document.createElement('div');
        liveBox.className = 'live-enhancement';
        card.appendChild(liveBox);
      }

      liveBox.innerHTML = savedContent;
    });
  }
};

const preserveLivePreviousRenderGames =
  Bolao.Predictions.renderGames.bind(Bolao.Predictions);

Bolao.Predictions.renderGames = function(week) {
  const liveContent = Bolao.PreserveLivePanels.capture();
  const result = preserveLivePreviousRenderGames(week);
  Bolao.PreserveLivePanels.restore(liveContent);
  return result;
};
