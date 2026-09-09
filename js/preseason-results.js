Bolao.PreseasonResults = {
  deadline() {
    return new Date(BOLAO_CONFIG.preseasonDeadline);
  },

  isReleased() {
    return Date.now() >= this.deadline().getTime();
  },

  escape(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  team(value) {
    if (!value) return 'Sem palpite';
    const item = (window.NFL_TEAMS || []).find(team =>
      team.abbr === value || team.id === value || team.name === value
    );
    return item ? item.name : value;
  },

  async render() {
    const released = this.isReleased();

    Bolao.App.content(`
      <div class="section-title">
        <h1>Palpites da pré-temporada</h1>
        <span class="badge">${released ? 'Palpites revelados' : 'Palpites privados'}</span>
      </div>
      <div id="preseason-results" class="card">
        ${released
          ? 'Carregando palpites...'
          : '<div class="notice">Os palpites de todos os participantes serão liberados após o encerramento do prazo, em 12 de setembro de 2026, às 00h00, horário de Brasília.</div>'}
      </div>
    `);

    if (!released) return;

    try {
      const usersSnapshot = await Bolao.db.collection('users').get();
      const users = usersSnapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.active !== false)
        .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || '', 'pt-BR'));

      const entries = await Promise.all(users.map(async user => {
        const snapshot = await Bolao.db
          .collection('userPredictions')
          .doc(user.uid)
          .collection('preseason')
          .doc(String(BOLAO_CONFIG.season))
          .get();

        return {
          user,
          picks: snapshot.exists ? snapshot.data().picks || null : null
        };
      }));

      this.renderEntries(entries);
    } catch (error) {
      document.querySelector('#preseason-results').innerHTML = `
        <div class="notice">Não foi possível carregar os palpites: ${this.escape(error.message)}</div>
      `;
    }
  },

  renderEntries(entries) {
    const box = document.querySelector('#preseason-results');

    if (!entries.length) {
      box.innerHTML = '<p>Nenhum participante ativo encontrado.</p>';
      return;
    }

    box.innerHTML = `
      <p class="muted">Participantes ativos: ${entries.length}. Os dados abaixo são apenas para consulta.</p>
      ${entries.map(({ user, picks }) => {
        const name = this.escape(user.name || user.email || 'Participante');

        if (!picks) {
          return `
            <details class="preseason-entry">
              <summary><b>${name}</b> · Sem palpite registrado</summary>
              <p class="muted">Nenhum palpite de pré-temporada foi salvo.</p>
            </details>
          `;
        }

        const divisions = [
          ['div_AFC_Leste', 'AFC Leste'],
          ['div_AFC_Oeste', 'AFC Oeste'],
          ['div_AFC_Sul', 'AFC Sul'],
          ['div_AFC_Norte', 'AFC Norte'],
          ['div_NFC_Leste', 'NFC Leste'],
          ['div_NFC_Oeste', 'NFC Oeste'],
          ['div_NFC_Sul', 'NFC Sul'],
          ['div_NFC_Norte', 'NFC Norte']
        ];

        return `
          <details class="preseason-entry">
            <summary><b>${name}</b></summary>
            <div class="table-wrap">
              <table>
                <tbody>
                  <tr><th>Campeão do Super Bowl</th><td>${this.escape(this.team(picks.champion))}</td></tr>
                  <tr><th>Vice-campeão</th><td>${this.escape(this.team(picks.runner))}</td></tr>
                  ${divisions.map(([key, label]) => `<tr><th>${label}</th><td>${this.escape(this.team(picks[key]))}</td></tr>`).join('')}
                  <tr><th>Wildcard AFC 1</th><td>${this.escape(this.team(picks.wcAFC1))}</td></tr>
                  <tr><th>Wildcard AFC 2</th><td>${this.escape(this.team(picks.wcAFC2))}</td></tr>
                  <tr><th>Wildcard AFC 3</th><td>${this.escape(this.team(picks.wcAFC3))}</td></tr>
                  <tr><th>Wildcard NFC 1</th><td>${this.escape(this.team(picks.wcNFC1))}</td></tr>
                  <tr><th>Wildcard NFC 2</th><td>${this.escape(this.team(picks.wcNFC2))}</td></tr>
                  <tr><th>Wildcard NFC 3</th><td>${this.escape(this.team(picks.wcNFC3))}</td></tr>
                  <tr><th>Pior campanha</th><td>${this.escape(this.team(picks.worst))}</td></tr>
                  <tr><th>MVP</th><td>${this.escape(picks.mvp || 'Sem palpite')}</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        `;
      }).join('')}
    `;
  }
};
