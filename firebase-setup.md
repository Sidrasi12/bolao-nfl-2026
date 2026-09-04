# Configuração do Firebase

1. Crie um projeto no Firebase Console e registre um aplicativo Web.
2. Ative **Authentication > Sign-in method > E-mail/senha**.
3. Crie o Firestore em `southamerica-east1`.
4. Copie o objeto de configuração para `js/firebase-config.js`.
5. Troque `SEU_EMAIL@EXEMPLO.COM` pelo e-mail do administrador.
6. Publique regras equivalentes às abaixo e, após o primeiro cadastro, defina `role: "admin"` no documento do usuário.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() { return signedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }
    match /users/{uid} {
      allow read: if signedIn();
      allow create: if signedIn() && request.auth.uid == uid;
      allow update: if isAdmin() || (request.auth.uid == uid && request.resource.data.role == resource.data.role);
    }
    match /predictions/{doc} {
      allow read: if signedIn();
      allow create, update: if signedIn() && request.resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }
    match /{document=**} { allow read, write: if isAdmin(); }
  }
}
```

## Publicação

Envie a pasta inteira para o Netlify Drop ou GitHub Pages. Depois, adicione o domínio publicado em **Authentication > Settings > Authorized domains**.

## Modo demonstração

Enquanto `apiKey` estiver como `COLE_AQUI`, o site funciona sem Firebase e salva os palpites em `localStorage`. Esse modo é adequado somente para avaliação local, não para o bolão real.
