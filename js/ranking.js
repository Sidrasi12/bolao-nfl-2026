Bolao.Ranking = {
  normalizarTexto(texto) {
    if (!texto) return '';
    return texto
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  },

  preseasonColumns: [
    { key: 'champion', label: 'Campeão' },
    { key: 'runner', label: 'Vice-campeão' },
    { key: 'worst', label: 'Pior time' },
    { key: 'mvp', label: 'MVP' },
    { key: 'div_AFC_Leste', label: 'AFC Leste' },
    { key: 'div_AFC_Oeste', label: 'AFC Oeste' },
    { key: 'div_AFC_Sul', label: 'AFC Sul' },
    { key: 'div_AFC_Norte', label: 'AFC Norte' },
    { key: 'div_NFC_Leste', label: 'NFC Leste' },
    { key: 'div_NFC_Oeste', label: 'NFC Oeste' },
    { key: 'div_NFC_Sul', label: 'NFC Sul' },
    { key: 'div_NFC_Norte', label: 'NFC Norte' },
    { key: 'wcAFC1', label: 'WC AFC 1' },
    { key: 'wcAFC2', label: 'WC AFC 2' },
    { key: 'wcAFC3', label: 'WC AFC 3' },
    { key: 'wcNFC1', label: 'WC NFC 1' },
    { key: 'wcNFC2', label: 'WC NFC 2' },
    { key: 'wcNFC3', label: 'WC NFC 3' }
  ],

  async render() {
    Bolao.App.content(`
      <div class="section-title">
        <h1>Ranking e premiação</h1>
        <select id="rank-mode" style="width:250px">
          <option value="general">Classificação geral</option>
          <option value="preseason">Pré-temporada</option>
          <option value="accumulated_regular">Temporada regular (Acumulado)</option>
          <option value="accumulated_playoffs">Playoffs (Acumulado)</option>
          <optgroup label="Rodadas - Temporada Regular">
            ${Array.from({ length: 18 }, (_, i) => `<option value="regular_${i + 1}">Rodada ${i + 1}</option>`).join('')}
          </optgroup>
          <optgroup label="Rodadas - Playoffs">
            ${['Wild Card', 'Divisional', 'Finais de Conferência', 'Super Bowl'].map((x, i) => `<option value="playoffs_${i + 1}">${x}</option>`).join('')}
          </optgroup>
        </select>
      </div>
      <div id="finance-summary" class="grid"></div>
      <div class="card" id="ranking" style="margin-top:16px">Carregando...</div>
      <div class="card" id="awards" style="margin-top:16px"></div>
      <div class="card" id="round-details" style="margin-top:16px"></div>
    `);
    document.querySelector('#rank-mode').onchange = e => this.load(e.target.value);
    await this.load('general');
  },

  async source() {
    const [us, ss, rs] = await Promise.all([
      Bolao.db.collection('users').get(),
      Bolao.db.collection('roundScores').where('season', '==', BOLAO_CONFIG.season).get(),
      Bolao.db.collection('roundResults').where('season', '==', BOLAO_CONFIG.season).get()
    ]);
    return {
      users: us.docs.map(d => ({ uid: d.id, ...d.data() })).filter(x => x.active !== false),
      scores: ss.docs.map(d => d.data()),
      roundResults: rs.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  },

  async loadPreseasonMatrix(users) {
    const gabSnap = await Bolao.db
      .collection('adminSettings')
      .doc(`preseason_result_${BOLAO_CONFIG.season}`)
      .get();

    const gabData = gabSnap.exists ? (gabSnap.data() || {}) : {};
    const gabarito = gabData.picks || gabData;

    const matrix = await Promise.all(users.map(async u => {
      const preSnap = await Bolao.db
        .collection('userPredictions')
        .doc(u.uid)
        .collection('preseason')
        .doc(String(BOLAO_CONFIG.season))
        .get();

      const picks = preSnap.exists ? (preSnap.data().picks || {}) : {};
      let acertos = 0;
      let erros = 0;
      let pontosCalculados = 0;
      const items = {};

      this.preseasonColumns.forEach(col => {
        const oficial = gabarito[col.key];
        const palpite = picks[col.key] || '—';
        const temOficial = Boolean(oficial && this.normalizarTexto(oficial) !== 'pendente');
        const acertou = temOficial && this.normalizarTexto(oficial) === this.normalizarTexto(palpite);
        const pts = acertou ? 5 : 0;

        if (temOficial) {
          if (acertou) {
            acertos++;
            pontosCalculados += pts;
          } else {
            erros++;
          }
        }

        items[col.key] = {
          palpite,
          oficial: temOficial ? oficial : 'Pendente',
          temOficial,
          acertou,
          pts
        };
      });

      const total = Number(u.preseasonPoints ?? pontosCalculados);
      return {
        uid: u.uid,
        name: u.name || u.email,
        total,
        preseason: total,
        regular: 0,
        playoffs: 0,
        winnerHits: acertos,
        difficultyHits: 0,
        acertos,
        erros,
        items
      };
    }));

    return {
      gabarito,
      rows: matrix.sort((a, b) => b.total - a.total || b.acertos - a.acertos || a.name.localeCompare(b.name))
    };
  },

  rows(users, scores, mode) {
    if (mode === 'general') {
      return users.map(u => {
        const a = scores.filter(x => x.userId === u.uid);
        const regular = a.filter(x => x.stage === 'regular' || !x.stage).reduce((s, x) => s + (x.points || 0), 0);
        const playoffs = a.filter(x => x.stage === 'playoffs').reduce((s, x) => s + (x.points || 0), 0);
        const preseason = u.preseasonPoints || 0;
        const winnerHits = a.reduce((s, x) => s + (x.winnerHits || 0), 0);
        const difficultyHits = a.reduce((s, x) => s + (x.difficultyHits || 0), 0);
        const total = +(regular + playoffs + preseason).toFixed(2);
        return { uid: u.uid, name: u.name || u.email, regular, playoffs, preseason, total, winnerHits, difficultyHits };
      });
    }

    if (mode === 'accumulated_regular') {
      return users.map(u => {
        const a = scores.filter(x => x.userId === u.uid && (x.stage === 'regular' || !x.stage));
        const regular = a.reduce((s, x) => s + (x.points || 0), 0);
        const winnerHits = a.reduce((s, x) => s + (x.winnerHits || 0), 0);
        const difficultyHits = a.reduce((s, x) => s + (x.difficultyHits || 0), 0);
        return { uid: u.uid, name: u.name || u.email, regular, playoffs: 0, preseason: 0, total: +regular.toFixed(2), winnerHits, difficultyHits };
      });
    }

    if (mode === 'accumulated_playoffs') {
      return users.map(u => {
        const a = scores.filter(x => x.userId === u.uid && x.stage === 'playoffs');
        const playoffs = a.reduce((s, x) => s + (x.points || 0), 0);
        const winnerHits = a.reduce((s, x) => s + (x.winnerHits
