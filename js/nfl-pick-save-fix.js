Bolao.NFLPickSaveFix = {
  updateCard(card, pick) {
    card.querySelectorAll('.choice[data-w]').forEach(button => {
      button.classList.toggle('selected', button.dataset.w === pick.winner);
    });

    card.querySelectorAll('.choice[data-d]').forEach(button => {
      button.classList.toggle('selected', button.dataset.d === pick.difficulty);
    });

    if (Bolao.PicksCompleteness) {
      Bolao.PicksCompleteness.apply();
    }
  },

  bind(week) {
    document.querySelectorAll('#games .game-card').forEach(card => {
      card.querySelectorAll('.choice').forEach(button => {
        button.onclick = async event => {
          event.preventDefault();

          const game = Bolao.Predictions.games.find(
            item => item.id === button.dataset.g
          );
          if (!game) return;

          const lockAt = new Date(game.date).getTime() -
            BOLAO_CONFIG.lockMinutes * 60000;

          if (Date.now() >= lockAt) {
            Bolao.App.toast('Prazo encerrado');
            return;
          }

          const pick = Bolao.Predictions.picks[game.id] =
            Bolao.Predictions.picks[game.id] || {};

          if (button.dataset.w) pick.winner = button.dataset.w;
          if (button.dataset.d) pick.difficulty = button.dataset.d;

          button.disabled = true;

          try {
            await Bolao.Predictions.saveGame(week, game, pick);
            Bolao.NFLPickSaveFix.updateCard(card, pick);
            Bolao.App.toast('Palpite salvo com segurança');
          } catch (error) {
            Bolao.App.toast(
              error.code === 'permission-denied'
                ? 'Prazo encerrado ou operação não permitida'
                : 'Erro ao salvar: ' + error.message
            );
          } finally {
            button.disabled = false;
          }
        };
      });
    });
  }
};

const nflPickSavePreviousRenderGames =
  Bolao.Predictions.renderGames.bind(Bolao.Predictions);

Bolao.Predictions.renderGames = function(week) {
  const result = nflPickSavePreviousRenderGames(week);
  Bolao.NFLPickSaveFix.bind(week);
  return result;
};
