Bolao.Profile = {
  escape(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  },

  render() {
    const user = Bolao.Auth.user;
    const favoriteTeam = user.favoriteTeam || '';

    Bolao.App.content(`
      <div class="section-title">
        <h1>Meu cadastro</h1>
        <span class="badge">Conta ${user.active ? 'ativa' : 'inativa'}</span>
      </div>

      <div class="form-grid">
        <form id="profile-name-form" class="card">
          <h2>Dados pessoais</h2>

          <label>
            Nome pelo qual gostaria de ser chamado
            <input id="profile-name" type="text" maxlength="40"
              value="${this.escape(user.name)}" required>
          </label>

          <label>
            E-mail
            <input type="email" value="${this.escape(user.email)}" disabled>
          </label>

          <label>
            Time preferido da NFL
            <select id="favorite-team">
              ${Bolao.teamOptions({}, favoriteTeam)}
            </select>
          </label>

          <div id="favorite-team-preview" class="favorite-team-preview"></div>

          <p class="muted">
            O nome aparece no cabeçalho, ranking e palpites. O escudo do time
            preferido aparecerá ao lado do seu nome no ranking.
          </p>

          <button type="submit">Atualizar cadastro</button>
        </form>

        <form id="profile-password-form" class="card">
          <h2>Alterar senha</h2>

          <label>
            Senha atual
            <input id="current-password" type="password"
              autocomplete="current-password" required>
          </label>

          <label>
            Nova senha
            <input id="new-password" type="password"
              autocomplete="new-password" minlength="6" required>
          </label>

          <label>
            Confirmar nova senha
            <input id="confirm-new-password" type="password"
              autocomplete="new-password" minlength="6" required>
          </label>

          <button type="submit">Atualizar senha</button>
        </form>
      </div>
    `);

    const select = document.querySelector('#favorite-team');
    select.onchange = () => this.renderTeamPreview(select.value);
    this.renderTeamPreview(favoriteTeam);

    document.querySelector('#profile-name-form').onsubmit = event =>
      this.saveProfile(event);
    document.querySelector('#profile-password-form').onsubmit = event =>
      this.savePassword(event);
  },

  renderTeamPreview(abbreviation) {
    const preview = document.querySelector('#favorite-team-preview');
    if (!preview) return;

    const team = Bolao.teamByAbbr(abbreviation);
    preview.innerHTML = team
      ? `<img src="${team.logo}" alt=""><span>${this.escape(team.name)}</span>`
      : '<span class="muted">Nenhum time selecionado.</span>';
  },

  async saveProfile(event) {
    event.preventDefault();
    const button = event.submitter;
    const name = document.querySelector('#profile-name').value.trim();
    const favoriteTeam = document.querySelector('#favorite-team').value;

    if (name.length < 2 || name.length > 40) {
      return Bolao.App.toast('O nome deve ter entre 2 e 40 caracteres');
    }

    if (favoriteTeam && !Bolao.teamByAbbr(favoriteTeam)) {
      return Bolao.App.toast('Selecione um time válido');
    }

    button.disabled = true;

    try {
      if (name !== Bolao.Auth.user.name) {
        await Bolao.Auth.updateName(name);
      }

      await Bolao.db.collection('users').doc(Bolao.Auth.user.uid).update({
        favoriteTeam,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      Bolao.Auth.user.favoriteTeam = favoriteTeam;
      Bolao.App.toast('Cadastro atualizado com sucesso');
    } catch (error) {
      Bolao.App.toast(
        error.code === 'permission-denied'
          ? 'Operação não permitida pelas regras do cadastro'
          : error.message
      );
    } finally {
      button.disabled = false;
    }
  },

  async savePassword(event) {
    event.preventDefault();
    const current = document.querySelector('#current-password').value;
    const next = document.querySelector('#new-password').value;
    const confirmation = document.querySelector('#confirm-new-password').value;
    const button = event.submitter;

    if (next !== confirmation) {
      return Bolao.App.toast('A confirmação da nova senha não confere');
    }

    if (next.length < 6) {
      return Bolao.App.toast('A nova senha deve ter pelo menos 6 caracteres');
    }

    button.disabled = true;

    try {
      await Bolao.Auth.updatePassword(current, next);
      event.target.reset();
      Bolao.App.toast('Senha atualizada com sucesso');
    } catch (error) {
      const message =
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
          ? 'Senha atual incorreta'
          : error.code === 'auth/weak-password'
            ? 'A nova senha é muito fraca'
            : error.code === 'auth/too-many-requests'
              ? 'Muitas tentativas. Aguarde e tente novamente'
              : error.message;
      Bolao.App.toast(message);
    } finally {
      button.disabled = false;
    }
  }
};
