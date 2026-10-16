// Ambiances, décors et petits effets des pages FUN30.
// Purement décoratif : aucune énigme, réponse ou progression n'est gérée ici (voir game.js).
// - <body data-theme="..."> : l'ambiance de la page (voir les décors ci-dessous)
// - écoute les événements « fun30:etape » émis par game.js (bonne réponse à une étape de photo)
(() => {
  const body = document.body;
  const niveau = Number(body.dataset.niveau);
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petit = window.innerWidth < 600;

  const $ = (id) => document.getElementById(id);
  const alea = (min, max) => min + Math.random() * (max - min);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const ajouter = (parent, cls, html, vars) => {
    const e = el('div', cls, html);
    if (vars) Object.entries(vars).forEach(([k, v]) => e.style.setProperty(k, v));
    parent.append(e);
    return e;
  };
  const melanger = (t) => t.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const lire = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  // ---------- Polices fantaisie (uniquement sur les pages qui s'en servent) ----------
  const POLICES = {
    manif: 'Permanent+Marker',
    halloween: 'Creepster',
  };
  const chargerPolice = (theme) => {
    if (!POLICES[theme] || document.getElementById('police-' + theme)) return;
    const l = el('link');
    l.id = 'police-' + theme;
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + POLICES[theme] + '&display=swap';
    document.head.append(l);
  };

  // ---------- Éléments de décor réutilisables ----------
  const skyline = () => {
    const s = el('div', 'skyline');
    const n = 18, w = 100 / n, pts = ['0% 100%'];
    for (let i = 0; i < n; i++) {
      const y = (100 - alea(25, 100)).toFixed(1);
      pts.push((i * w).toFixed(2) + '% ' + y + '%', ((i + 1) * w).toFixed(2) + '% ' + y + '%');
    }
    pts.push('100% 100%');
    s.style.clipPath = 'polygon(' + pts.join(',') + ')';
    return s;
  };
  const nuages = (f, n, yMin, yMax) => {
    for (let i = 0; i < n; i++) {
      const d = alea(60, 130);
      ajouter(f, 'nuage', '', { '--y': alea(yMin, yMax) + 'vh', '--l': alea(90, 190) + 'px', '--d': d + 's', '--delay': -alea(0, d) + 's' });
    }
  };

  // Les deux mains du « 6-7 » (palmes vers le haut, en alternance)
  const mainOk = (() => {
    try {
      const c = document.createElement('canvas').getContext('2d');
      c.font = '32px sans-serif';
      return c.measureText('\u{1FAF4}').width !== c.measureText('\u{10FFFE}').width;
    } catch (e) { return false; }
  })();
  const MAIN = mainOk ? '\u{1FAF4}' : '✋';
  const s67 = () => '<span class="main">' + MAIN + '</span><span class="main" style="scale:-1 1">' + MAIN + '</span><b>6</b><b>7</b>';

  // ---------- Décors par thème : { couleur (barre du navigateur), icone (onglet), deco (bandeau), fond } ----------
  const THEMES = {
    colis: {
      couleur: '#ffd200', icone: '📦', deco: '<span>📦</span>',
      fond: (f) => {
        for (let i = 0; i < (petit ? 8 : 14); i++) {
          const d = alea(16, 34);
          ajouter(f, 'boite', '📦', { left: alea(0, 96) + '%', 'font-size': alea(22, 46) + 'px', '--d': d + 's', '--delay': -alea(0, d) + 's' });
        }
      },
    },

    manif: {
      couleur: '#e53935', icone: '✊', deco: '<div class="s67">' + s67() + '</div>',
      fond: (f) => {
        const slogans = melanger([
          'ACAB', 'Les feux de poubelles, ça fait peur qu\' aux ordures', '6 7 !!!', 'J\'ai mis plus de budget dans ma pancarte que l\état dans nos études',
          'Le Wi-Fi est un droit', 'La jeunesse vise le BAC 🔫 la BAC vise la tête', 'L\état nous la met à l\'envers, on lui mai 68',
          'La dépression c\'est un critère sur PARCOURSUP ?!', 'CRS MONTRE TES FESSES', '1 Prof pour 35 élèves, 5 CRS pour un élève !', '67 ? 67 !',
          'Difficile de passer le BAC avec une main en moins', 'Trop jeunes pour voter, assez jeune pour être gazer',
        ]);
        const couleurs = ['#ffffff', '#fff59d', '#ffccbc', '#b3e5fc', '#c8e6c9', '#f8bbd0'];
        const n = petit ? 7 : 11;
        for (let i = 0; i < n; i++) {
          const d = alea(26, 50);
          ajouter(f, 'pancarte' + (i % 3 === 0 ? ' retour' : ''),
            '<div class="planche">' + slogans[i % slogans.length] + '</div><div class="manche"></div>',
            { '--y': alea(0, 62) + 'vh', '--d': d + 's', '--delay': -alea(0, d) + 's', '--l': alea(130, 190) + 'px', '--c': couleurs[i % couleurs.length] });
        }
        ajouter(f, 's67 coin-bas', s67());
        ajouter(f, 's67 coin-haut', s67());
        // De temps en temps, un énorme « 67 » apparaît quelque part
        if (!reduit) {
          const teintes = ['#e53935', '#ff9800', '#1e88e5', '#8e24aa', '#43a047'];
          setInterval(() => {
            const p = ajouter(f, 'pop67', '67', { left: alea(2, 70) + 'vw', top: alea(8, 62) + 'vh', '--c': teintes[Math.floor(alea(0, teintes.length))] });
            setTimeout(() => p.remove(), 2600);
          }, 3800);
        }
        // Banderole qui défile sous le bandeau
        const hero = document.querySelector('.hero');
        if (hero && !document.querySelector('.banderole')) {
          const txt = 'Grève générale du 17/10 ✊ NIK l\'état ✊ 6 7 6 7 6 7 ✊ ';
          hero.after(el('div', 'banderole', '<div>' + txt + txt + txt + '</div>'));
        }
      },
    },

    rap: {
      couleur: '#8a2be2', icone: '🎤', deco: '<span>🎤</span><span class="vinyle">💿</span>',
      fond: (f) => {
        ajouter(f, 'halo a');
        ajouter(f, 'halo b');
        const eq = ajouter(f, 'eq');
        for (let i = 0; i < (petit ? 24 : 46); i++) {
          const b = el('span');
          b.style.setProperty('--h', alea(0.25, 1).toFixed(2));
          b.style.setProperty('--d', alea(0.35, 0.9).toFixed(2) + 's');
          b.style.setProperty('--delay', -alea(0, 1).toFixed(2) + 's');
          eq.append(b);
        }
        // L'égaliseur ne danse que pendant la lecture d'un son
        const lecteurs = document.querySelectorAll('audio');
        const maj = () => body.classList.toggle('lecture', [...lecteurs].some((a) => !a.paused && !a.ended));
        lecteurs.forEach((a) => ['play', 'pause', 'ended'].forEach((ev) => a.addEventListener(ev, maj)));
      },
    },

    theatre: {
      couleur: '#7d0f1f', icone: '🎭', deco: '<span>🎭</span>',
      fond: (f) => {
        ajouter(f, 'projo g');
        ajouter(f, 'projo d');
        ajouter(f, 'rideau g');
        ajouter(f, 'rideau d');
      },
    },

    halloween: {
      couleur: '#24103a', icone: '🎃', deco: '<span>🎃</span>',
      fond: (f) => {
        ajouter(f, 'lune');
        ajouter(f, 'eclair');
        ajouter(f, 'brouillard');
        ajouter(f, 'brouillard b');
        for (let i = 0; i < (petit ? 5 : 8); i++) {
          const d = alea(11, 24);
          ajouter(f, 'chauve', '<span>🦇</span>', { '--y': alea(3, 60) + 'vh', '--t': alea(22, 44) + 'px', '--d': d + 's', '--delay': -alea(0, d) + 's' });
        }
        [['6vw', '58vh'], ['84vw', '68vh'], ['46vw', '78vh']].forEach(([x, y], i) => {
          const d = alea(7, 12);
          ajouter(f, 'fantome', '👻', { '--x': x, '--y': y, '--t': alea(34, 54) + 'px', '--d': d + 's', '--delay': -i * 3 + 's' });
        });
        ajouter(f, 'araignee', '<span>🕷️</span>');
      },
    },

    parc: {
      couleur: '#a5ddff', icone: '🌳', deco: '<span>🌳</span>',
      fond: (f) => {
        ajouter(f, 'soleil');
        nuages(f, 4, 4, 40);
        ajouter(f, 'colline b');
        ajouter(f, 'colline');
        [['3vw', '🌳', 62], ['14vw', '🌼', 30], ['30vw', '🌷', 30], ['68vw', '🌼', 30], ['80vw', '🌳', 66], ['93vw', '🌷', 30]].forEach(([x, e, t], i) => {
          ajouter(f, 'petit', e, { '--x': x, '--b': '5vh', '--t': t + 'px', '--delay': -i * 0.4 + 's' });
        });
        for (let i = 0; i < 3; i++) ajouter(f, 'papillon', '🦋', { '--x': alea(10, 85) + 'vw', '--y': alea(45, 70) + 'vh', '--delay': -i * 3 + 's' });
      },
    },

    route: {
      couleur: '#ffb347', icone: '🚶', deco: '<span>🚶</span>',
      fond: (f) => {
        ajouter(f, 'soleil');
        nuages(f, 3, 8, 45);
        ajouter(f, 'route');
        ['🚶', '🚶‍♀️', '🏃', '🚶‍♂️'].forEach((e, i) => {
          const d = alea(26, 40);
          ajouter(f, 'marcheur', '<span>' + e + '</span>', { '--d': d + 's', '--delay': -i * (d / 4) + 's' });
        });
      },
    },

    ciel: {
      couleur: '#2f80d8', icone: '🎈', deco: '<span>🕊️</span>',
      fond: (f) => {
        ajouter(f, 'soleil');
        nuages(f, petit ? 5 : 8, 3, 70);
        ajouter(f, 'ballon', '<span>🎈</span>');
        for (let i = 0; i < 3; i++) {
          const d = alea(18, 30);
          ajouter(f, 'oiseau', '🕊️', { '--y': alea(8, 55) + 'vh', '--d': d + 's', '--delay': -alea(0, d) + 's' });
        }
        f.append(skyline());
      },
    },

    paris: {
      couleur: '#26194d', icone: '🌙', deco: '<span>🌙</span>',
      fond: (f) => {
        for (let i = 0; i < (petit ? 40 : 80); i++) {
          const d = alea(1.5, 4);
          ajouter(f, 'etoile', '', { '--x': alea(0, 100) + '%', '--y': alea(0, 75) + '%', '--t': alea(1.5, 3.5) + 'px', '--d': d + 's', '--delay': -alea(0, d) + 's' });
        }
        ajouter(f, 'lune petite');
        f.append(skyline());
      },
    },
  };

  const icone = (emoji) => 'data:image/svg+xml,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='88'>" + emoji + '</text></svg>');

  // Applique (ou remplace) l'ambiance d'une page
  const appliquer = (nom) => {
    const t = THEMES[nom];
    if (!t) return;
    body.dataset.theme = nom;
    chargerPolice(nom);

    document.querySelectorAll('.fond, .hero-deco').forEach((e) => e.remove());
    const fond = el('div', 'fond');
    fond.setAttribute('aria-hidden', 'true');
    body.prepend(fond);
    body.classList.add('avec-fond');
    if (!reduit) t.fond(fond);
    else body.classList.remove('avec-fond');

    const wrap = document.querySelector('.hero .wrap');
    if (wrap) {
      const deco = el('div', 'hero-deco', t.deco);
      deco.setAttribute('aria-hidden', 'true');
      wrap.append(deco);
    }

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = el('meta'); meta.name = 'theme-color'; document.head.append(meta); }
    meta.content = t.couleur;
    let lien = document.querySelector('link[rel="icon"]');
    if (!lien) { lien = el('link'); lien.rel = 'icon'; document.head.append(lien); }
    lien.href = icone(t.icone);
  };
  if (body.dataset.theme) appliquer(body.dataset.theme);

  // ---------- En-tête : étape + barre d'avancement ----------
  const PAGES = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 6, 8: 7, 9: 8 };
  const rang = PAGES[niveau];
  const entete = document.querySelector('header.main');
  const btnAide = $('btn-aide');
  if (rang && entete) {
    const droite = el('div', 'entete-droite', '<span class="etape-pill">Étape ' + rang + '/8</span>');
    if (btnAide) droite.append(btnAide);
    entete.querySelector('.wrap').append(droite);
    const barre = el('div', 'avancement', '<i></i>');
    entete.append(barre);
    const trait = barre.firstChild;
    trait.style.width = ((rang - 1) / 8) * 100 + '%';
    requestAnimationFrame(() => requestAnimationFrame(() => { trait.style.width = ((rang - 0.5) / 8) * 100 + '%'; }));
  }

  // Le bouton « ? » se met à pulser si on reste longtemps sans l'utiliser
  if (btnAide) {
    const minuteur = setTimeout(() => { if (!btnAide.hidden) btnAide.classList.add('appel'); }, 75000);
    btnAide.addEventListener('click', () => { clearTimeout(minuteur); btnAide.classList.remove('appel'); });
  }

  // ---------- Barre de progression sous le compteur (« Photo 2 sur 5 », « 3 lieux trouvés sur 15 ») ----------
  const compteur = $('compteur');
  if (compteur) {
    const barre = el('div', 'progression', '<i></i>');
    compteur.after(barre);
    const maj = () => {
      const m = compteur.textContent.match(/(\d+)\D+(\d+)/);
      if (!m) return;
      const n = Number(m[1]) - (/^\s*photo/i.test(compteur.textContent) ? 1 : 0);
      barre.firstChild.style.width = Math.max(0, Math.min(100, (n / Number(m[2])) * 100)) + '%';
    };
    new MutationObserver(maj).observe(compteur, { childList: true, characterData: true, subtree: true });
    maj();
  }

  // ---------- Photos : toucher pour agrandir ----------
  const photo = $('photo');
  if (photo && photo.closest('.carte')) {
    photo.after(el('p', 'legende-zoom', '🔍 Touchez la photo pour l’agrandir'));
  }
  const fermerZoom = () => { const z = document.querySelector('.zoom'); if (z) z.remove(); };
  document.addEventListener('click', (e) => {
    const cible = e.target;
    if (cible.closest && cible.closest('.zoom')) return fermerZoom();
    if (!cible.matches || !cible.matches('#photo, .galerie img') || !cible.src) return;
    const z = el('div', 'zoom', '<button type="button" aria-label="Fermer">&times;</button>');
    const img = el('img');
    img.src = cible.src;
    img.alt = cible.alt;
    z.append(img);
    body.append(z);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerZoom(); });

  // ---------- Quiz : marque les réponses déjà essayées ----------
  const quiz = $('quiz');
  if (quiz) {
    const cle = 'fun30_quiz_' + niveau;
    const marquer = () => {
      const vues = (lire(cle) || '').split(',');
      quiz.querySelectorAll('[data-photo]').forEach((b) => b.classList.toggle('essaye', vues.includes(b.dataset.photo)));
    };
    marquer();
    quiz.querySelectorAll('[data-photo]').forEach((b) => b.addEventListener('click', () => {
      b.classList.remove('secoue');
      void b.offsetWidth;
      b.classList.add('secoue');
      setTimeout(marquer, 0);
    }));
  }

  // ---------- Carte : indication pour faire défiler sur petit écran ----------
  const defile = document.querySelector('.plan-defile');
  if (defile && defile.scrollWidth > defile.clientWidth + 8) {
    const info = el('p', 'glisse-info', '↔ Faites glisser la carte');
    defile.before(info);
    defile.addEventListener('scroll', () => info.remove(), { once: true });
  }

  // ---------- Pause fraîcheur : un message pendant l'attente, le bouton « Suite » apparaît en fanfare ----------
  const btnPause = $('btn-pause');
  const btnSuite = $('btn-suite');
  const blocFin = $('fin');
  if (btnPause && btnSuite && blocFin) {
    const info = el('p', 'pause-info', '<span>🍦</span> Pause fraîcheur en cours…');
    info.hidden = true;
    btnSuite.before(info);
    let apparu = false;
    const maj = () => {
      info.hidden = !(btnPause.hidden && btnSuite.hidden && !blocFin.hidden);
      if (!btnSuite.hidden && !apparu) {
        apparu = true;
        btnSuite.classList.add('pop');
      }
      // Une fois la pause finie, retour au grand soleil (le décor de nuit n'a plus lieu d'être)
      if (!blocFin.hidden && body.dataset.theme !== 'parc') appliquer('parc');
    };
    new MutationObserver(maj).observe(blocFin, { attributes: true, attributeFilter: ['hidden'] });
    [btnPause, btnSuite].forEach((b) => new MutationObserver(maj).observe(b, { attributes: true, attributeFilter: ['hidden'] }));
    maj();
  }

  // ---------- Écran noir : la bonne réponse « temple » (étape 1 de la page niveau 2) plonge tout dans le noir ----------
  const CLE_NOIR = 'fun30_noir';
  const DUREE_NOIR = 20000;
  const BOUTON_NOIR = 5000; // le bouton « Fermer » apparaît au bout de 5 s
  const noir = (finTs) => {
    if (document.querySelector('.noir')) return;
    const voile = el('div', 'noir', '<p>Bismillah, c’est les ténèbres</p>');
    voile.setAttribute('aria-live', 'polite');
    const bouton = el('button', 'noir-fermer', 'Fermer ✕');
    bouton.type = 'button';
    bouton.hidden = true;
    voile.append(bouton);
    const zones = document.querySelectorAll('header.main, main, footer, .overlay');
    zones.forEach((z) => { z.inert = true; });
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    body.append(voile);
    document.documentElement.style.overflow = 'hidden';
    let fini = false;
    const lever = () => {
      if (fini) return;
      fini = true;
      clearTimeout(minuteur);
      clearTimeout(minuteurBouton);
      ecrire(CLE_NOIR, 0);
      zones.forEach((z) => { z.inert = false; });
      document.documentElement.style.overflow = '';
      voile.classList.add('sort');
      setTimeout(() => voile.remove(), 1600);
    };
    const minuteur = setTimeout(lever, Math.max(0, finTs - Date.now()));
    const minuteurBouton = setTimeout(() => { bouton.hidden = false; bouton.focus(); },
      Math.max(0, finTs - DUREE_NOIR + BOUTON_NOIR - Date.now()));
    bouton.addEventListener('click', lever);
  };
  // Le noir survit au rechargement de la page : on mémorise l'heure de fin
  const finNoir = Number(lire(CLE_NOIR));
  if (finNoir > Date.now()) noir(finNoir);
  document.addEventListener('fun30:etape', (e) => {
    if (e.detail.niveau === 2 && e.detail.etape === 0) {
      const fin = Date.now() + DUREE_NOIR;
      ecrire(CLE_NOIR, fin);
      noir(fin);
    }
  });

  // ---------- Feu d'artifice final (en plus des serpentins de game.js) ----------
  const feuxArtifice = (duree = 9000) => {
    if (reduit) return;
    const toile = el('canvas');
    toile.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:55';
    body.append(toile);
    const ctx = toile.getContext('2d');
    const l = (toile.width = window.innerWidth);
    const h = (toile.height = window.innerHeight);
    const debut = performance.now();
    let dernier = 0;
    let particules = [];
    const gerbe = () => {
      const x = alea(l * 0.15, l * 0.85), y = alea(h * 0.12, h * 0.5);
      const couleur = 'hsl(' + Math.floor(alea(0, 360)) + ' 100% 60%)';
      for (let i = 0; i < 70; i++) {
        const a = alea(0, 6.283), v = alea(1.5, 6);
        particules.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 1, couleur });
      }
    };
    const image = (t) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, l, h);
      ctx.globalCompositeOperation = 'lighter';
      if (t - debut < duree && t - dernier > 450) { gerbe(); dernier = t; }
      particules.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.985; p.vie -= 0.012;
        ctx.globalAlpha = Math.max(p.vie, 0);
        ctx.fillStyle = p.couleur;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      particules = particules.filter((p) => p.vie > 0);
      if (particules.length || t - debut < duree) requestAnimationFrame(image);
      else toile.remove();
    };
    requestAnimationFrame(image);
  };
  const finJeu = $('fin-jeu');
  if (finJeu) {
    new MutationObserver(() => { if (!finJeu.hidden) feuxArtifice(); }).observe(finJeu, { attributes: true, attributeFilter: ['hidden'] });
  }
})();
