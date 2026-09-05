Bolao.Auth = {
  user: null,

  cleanName(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40);
  },

  async ensureProfile(firebaseUser) {
    const ref = Bolao.db.collection('users').doc(firebaseUser.uid);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      await ref.set({
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: 'player',
        active: true,
        paid: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    const updatedSnapshot = await ref.get();
    return updatedSnapshot.data();
  },

  async init() {
    const config = BOLAO_CONFIG.firebase;

    if (config.apiKey === 'COLE_AQUI') {
      Bolao.App.toast('Preserve seu firebase-config.js atual antes de publicar');
      return Bolao.App.showAuth();
    }

    firebase.initializeApp(config);
    Bolao.db = firebase.firestore();
    Bolao.fbAuth = firebase.auth();

    Bolao.fbAuth.onAuthStateChanged(async firebaseUser => {
      if (!firebaseUser) {
        this.user = null;
        return Bolao.App.showAuth();
      }

      try {
        const profile = await this.ensureProfile(firebaseUser);

        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: profile.role || 'player',
          active: profile.active !== false,
          paid: profile.paid === true,
          emailVerified: firebaseUser.emailVerified
        };

        Bolao.App.enter(this.user);
      } catch (error) {
        console.error('Erro ao carregar ou criar perfil:', error);
        Bolao.App.toast('Conta criada, mas o perfil não pôde ser carregado: ' + error.message);
      }
    });
  },

  login(email, password) {
    return Bolao.fbAuth.signInWithEmailAndPassword(email.trim(), password);
  },

  async register(name, email, password) {
    const cleanName = this.cleanName(name);

    if (cleanName.length < 2) {
      throw new Error('Informe um nome com pelo menos 2 caracteres.');
    }

    const result = await Bolao.fbAuth.createUserWithEmailAndPassword(
      email.trim(),
      password
    );

    await result.user.updateProfile({
      displayName: cleanName
    });

    return result;
  },

  resetPassword(email) {
    return Bolao.fbAuth.sendPasswordResetEmail(email.trim());
  },

  async updateName(name) {
    const cleanName = this.cleanName(name);

    if (cleanName.length < 2) {
      throw new Error('Informe um nome com pelo menos 2 caracteres.');
    }

    const firebaseUser = Bolao.fbAuth.currentUser;

    if (!firebaseUser) {
      throw new Error('Sessão expirada. Entre novamente.');
    }

    await Bolao.db.collection('users').doc(firebaseUser.uid).update({
      name: cleanName,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await firebaseUser.updateProfile({
      displayName: cleanName
    });

    this.user.name = cleanName;
    document.querySelector('#user-name').textContent = cleanName;

    return cleanName;
  },

  async updatePassword(currentPassword, newPassword) {
    const firebaseUser = Bolao.fbAuth.currentUser;

    if (!firebaseUser) {
      throw new Error('Sessão expirada. Entre novamente.');
    }

    const credential = firebase.auth.EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword
    );

    await firebaseUser.reauthenticateWithCredential(credential);
    await firebaseUser.updatePassword(newPassword);
  },

  logout() {
    return Bolao.fbAuth.signOut();
  }
};
