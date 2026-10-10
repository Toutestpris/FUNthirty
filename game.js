// Moteur commun à toutes les pages FUN30.
// - <body data-niveau="N"> : numéro de l'énigme de la page
// - <body data-intro> : la page commence par une intro (popup + bouton OK) qui masque l'énigme
// - la progression est mémorisée dans le navigateur ; une page dont le niveau
//   n'est pas débloqué renvoie vers index.html.
(() => {
  const CLE_NIVEAU = 'fun30_niveau';
  const CLE_OK = 'fun30_ok_';
  const niveau = Number(document.body.dataset.niveau);

  const lire = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const effacer = () => { try { localStorage.clear(); } catch (e) {} };

  // index.html?reset : repart de zéro (utile pour tester)
  if (new URLSearchParams(location.search).has('reset')) {
    effacer();
    location.replace(location.pathname);
    return;
  }

  const debloque = () => Number(lire(CLE_NIVEAU)) || 1;
  if (niveau > debloque()) {
    location.replace('index.html');
    return;
  }

  const $ = (id) => document.getElementById(id);

  // ---------- Hash simple (cyrb53) : les réponses ne sont pas en clair dans le JSON ----------
  const hash = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  };

  // Minuscules, sans accents, ponctuation et espaces unifiés
  const norm = (s) => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // ---------- Fenêtres modales ----------
  const ouvrir = (el) => { el.hidden = false; };
  const fermer = (el) => { el.hidden = true; };

  document.querySelectorAll('.overlay [data-fermer]').forEach((b) =>
    b.addEventListener('click', () => fermer(b.closest('.overlay'))));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.overlay').forEach(fermer);
  });

  // Fenêtre d'aide : cliquer à côté de la fenêtre la ferme
  const aide = $('aide');
  if (aide) {
    aide.addEventListener('click', (e) => { if (e.target === aide) fermer(aide); });
  }

  // ---------- Intro (popup + OK) ----------
  const aIntro = 'intro' in document.body.dataset;
  const btnAide = $('btn-aide');

  const reveler = () => {
    document.querySelectorAll('[data-avant-ok]').forEach((el) => { el.hidden = true; });
    document.querySelectorAll('[data-apres-ok]').forEach((el) => { el.hidden = false; });
    if (btnAide) btnAide.hidden = false;
  };

  if (aIntro && lire(CLE_OK + niveau) !== '1') {
    const popup = $('popup');
    if (popup) ouvrir(popup);
    $('ok').addEventListener('click', () => {
      ecrire(CLE_OK + niveau, '1');
      reveler();
    });
  } else {
    reveler();
  }

  if (btnAide && aide) btnAide.addEventListener('click', () => ouvrir(aide));

  // Indice caché : un bouton data-reveler="id" affiche l'élément id (mémorisé)
  document.querySelectorAll('[data-reveler]').forEach((b) => {
    const cible = $(b.dataset.reveler);
    const cle = 'fun30_indice_' + niveau + '_' + cible.id;
    const montrer = () => { cible.hidden = false; b.hidden = true; };
    if (lire(cle) === '1') montrer();
    b.addEventListener('click', () => { ecrire(cle, '1'); montrer(); });
  });

  // ---------- Énigme ----------
  // Une énigme simple a "reponses" ; une énigme à étapes (photos) a "etapes" :
  // [{ image, invite, reponses }], l'étape en cours étant mémorisée dans le navigateur.
  const form = $('reponse');
  const erreur = $('erreur');
  const CLE_ETAPE = 'fun30_etape_' + niveau;

  let config;
  const charger = async () => {
    if (!config) {
      const r = await fetch('enigmes.json', { cache: 'no-store' });
      config = (await r.json())[niveau];
    }
    return config;
  };

  // ---------- Quiz à choix : les mauvaises réponses (data-photo) affichent leur photo ;
  // la bonne (data-bonne) ne se débloque qu'une fois toutes les mauvaises essayées ----------
  const quiz = $('quiz');
  if (quiz) {
    const CLE_QUIZ = 'fun30_quiz_' + niveau;
    const vues = (lire(CLE_QUIZ) || '').split(',').filter(Boolean);
    const fausses = quiz.querySelectorAll('[data-photo]');
    const bonne = quiz.querySelector('[data-bonne]');
    const galerie = $('galerie');

    const ajouterPhoto = (src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Mauvaise réponse';
      galerie.appendChild(img);
      return img;
    };
    const maj = () => { bonne.disabled = vues.length < fausses.length; };

    vues.forEach(ajouterPhoto);
    maj();
    fausses.forEach((b) => b.addEventListener('click', () => {
      const src = b.dataset.photo;
      if (vues.includes(src)) return;
      vues.push(src);
      ecrire(CLE_QUIZ, vues.join(','));
      ajouterPhoto(src).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      maj();
    }));
    bonne.addEventListener('click', async () => {
      if (bonne.disabled) return;
      try {
        const cfg = await charger();
        ecrire(CLE_NIVEAU, Math.max(debloque(), niveau + 1));
        location.href = cfg.suivant;
      } catch (err) {
        alert("Impossible de charger enigmes.json. En local, lancez un petit serveur web au lieu d'ouvrir le fichier directement.");
      }
    });
  }

  if (!form) return;

  // Dernière énigme : un bloc #fin remplace le formulaire une fois l'énigme résolue
  const fin = $('fin');
  const afficherFin = () => { form.closest('.carte').hidden = true; fin.hidden = false; };
  if (fin && debloque() > niveau) afficherFin();

  const etapeCourante = () => Number(lire(CLE_ETAPE)) || 0;

  const afficherEtape = (cfg) => {
    const etape = cfg.etapes[etapeCourante()];
    $('photo').src = etape.image;
    $('invite').textContent = etape.invite;
    $('compteur').textContent = 'Photo ' + (etapeCourante() + 1) + ' sur ' + cfg.etapes.length;
    form.reponse.value = '';
    form.reponse.focus();
  };

  if ($('photo')) {
    charger().then((cfg) => { if (cfg.etapes) afficherEtape(cfg); }).catch(() => {});
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erreur.classList.remove('visible');

    let cfg;
    try {
      cfg = await charger();
    } catch (err) {
      erreur.textContent = "Impossible de charger enigmes.json. En local, lancez un petit serveur web au lieu d'ouvrir le fichier directement.";
      erreur.classList.add('visible');
      return;
    }

    const etapes = cfg.etapes;
    const attendues = etapes ? etapes[etapeCourante()].reponses : cfg.reponses;
    const saisie = norm(form.reponse.value);

    if (!saisie || !attendues.includes(hash(saisie))) {
      erreur.textContent = etapes
        ? "Ce n'est pas la bonne rue. Regardez bien la photo et allez la chercher sur place."
        : "Ce n'est pas la bonne réponse. Relisez les indices ou demandez de l'aide avec le bouton « ? ».";
      erreur.classList.add('visible');
      return;
    }

    if (etapes && etapeCourante() + 1 < etapes.length) {
      ecrire(CLE_ETAPE, etapeCourante() + 1);
      afficherEtape(cfg);
      return;
    }
    ecrire(CLE_NIVEAU, Math.max(debloque(), niveau + 1));
    if (fin) afficherFin();
    else location.href = cfg.suivant;
  });
})();
