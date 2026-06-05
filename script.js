(function(){
  'use strict';

  const STORE_KEY = 'cv_profiles';
  const ACTIVE_KEY = 'cv_active_profile';
  const THEME_KEY = 'cv_theme';
  const ACCENT_KEY = 'cv_accent_color';
  const DEFAULT_JSON_URL = 'default_cv.json';

  let dragMode = false, dragSrc = null;
  let cvData = {};

  // --- Gestion des profils ---
  function getProfiles() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e) { return {}; } }
  function saveProfiles(p) { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
  function getActiveName() { return localStorage.getItem(ACTIVE_KEY) || 'Défaut'; }

  function captureState() {
    const nameEl = document.querySelector('.cv-name');
    const titleEl = document.querySelector('.cv-title');
    const contactSpans = document.querySelectorAll('.cv-contacts span');
    const infos = {
      name: nameEl ? nameEl.textContent.trim() : '',
      title: titleEl ? titleEl.textContent.trim() : '',
      contacts: Array.from(contactSpans).map(span => span.textContent.trim())
    };
    return {
      infos: infos,
      tagline: cvData.tagline,
      experiences: cvData.experiences,
      competences: cvData.competences,
      langues: cvData.langues,
      projets: cvData.projets,
      interets: cvData.interets,
      liens: cvData.liens,
      etudes: cvData.etudes
    };
  }

  function applyState(state) {
    if (!state) return;
    if (state.infos) {
      const nameEl = document.querySelector('.cv-name');
      const titleEl = document.querySelector('.cv-title');
      const contactSpans = document.querySelectorAll('.cv-contacts span');
      if (nameEl) nameEl.textContent = state.infos.name || '';
      if (titleEl) titleEl.textContent = state.infos.title || '';
      if (contactSpans.length && state.infos.contacts) {
        state.infos.contacts.forEach((contact, i) => {
          if (contactSpans[i]) contactSpans[i].textContent = contact;
        });
      }
    }
    cvData.tagline = state.tagline || '';
    cvData.experiences = state.experiences || [];
    cvData.competences = state.competences || [];
    cvData.langues = state.langues || [];
    cvData.projets = state.projets || [];
    cvData.interets = state.interets || '';
    cvData.liens = state.liens || [];
    cvData.etudes = state.etudes || [];
    renderAll();
  }

  function saveCurrentProfile() {
    let name = getActiveName();
    let profiles = getProfiles();
    profiles[name] = captureState();
    saveProfiles(profiles);
    showToast('Profil "' + name + '" sauvegardé ✓');
  }

  function loadProfile(name) {
    let profiles = getProfiles();
    if (!profiles[name]) return;
    localStorage.setItem(ACTIVE_KEY, name);
    applyState(profiles[name]);
    renderSelect();
  }

  function newProfile() {
    let name = prompt('Nom du nouveau profil :');
    if (!name?.trim()) return;
    let profiles = getProfiles();
    profiles[name.trim()] = captureState();
    saveProfiles(profiles);
    localStorage.setItem(ACTIVE_KEY, name.trim());
    loadProfile(name.trim());
  }

  function deleteProfile() {
    let name = getActiveName();
    if (name === 'Défaut') { showToast('Profil Défaut non supprimable'); return; }
    if (!confirm(`Supprimer "${name}" ?`)) return;
    let profiles = getProfiles();
    delete profiles[name];
    let keys = Object.keys(profiles);
    let next = keys.length ? keys[0] : 'Défaut';
    if (!profiles[next]) profiles[next] = captureState();
    saveProfiles(profiles);
    localStorage.setItem(ACTIVE_KEY, next);
    loadProfile(next);
  }

  function renderSelect() {
    let sel = document.getElementById('profile-select');
    if (!sel) return;
    let active = getActiveName();
    let profiles = getProfiles();
    sel.innerHTML = '';
    Object.keys(profiles).forEach(name => {
      let opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === active) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // --- Rendu principal ---
  function renderAll() {
    renderSidebar();
    renderMain();
    const taglineDiv = document.getElementById('tagline-display');
    if (taglineDiv) {
      taglineDiv.textContent = cvData.tagline;
      taglineDiv.addEventListener('blur', () => {
        cvData.tagline = taglineDiv.textContent;
        saveCurrentProfile();
      });
    }
    const nameEl = document.querySelector('.cv-name');
    const titleEl = document.querySelector('.cv-title');
    const contactSpans = document.querySelectorAll('.cv-contacts span');
    if (nameEl) nameEl.addEventListener('blur', () => saveCurrentProfile());
    if (titleEl) titleEl.addEventListener('blur', () => saveCurrentProfile());
    contactSpans.forEach(span => span.addEventListener('blur', () => saveCurrentProfile()));
  }

  function renderSidebar() {
    const sidebar = document.getElementById('cv-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';

    addSectionTitle(sidebar, 'Compétences techniques');
    const skillsDiv = document.createElement('div');
    skillsDiv.className = 'cv-tags';
    cvData.competences.forEach((skill, idx) => {
      const tag = document.createElement('span');
      tag.className = 'cv-tag';
      tag.innerHTML = `${escapeHtml(skill)} <button class="delete-item-btn" data-type="skill" data-index="${idx}">🗑️</button>`;
      skillsDiv.appendChild(tag);
    });
    sidebar.appendChild(skillsDiv);
    const addSkillBtn = document.createElement('button');
    addSkillBtn.textContent = '+ Ajouter compétence';
    addSkillBtn.className = 'icon-btn';
    addSkillBtn.onclick = () => { let ns = prompt('Nouvelle compétence:'); if(ns) { cvData.competences.push(ns); renderAll(); saveCurrentProfile(); } };
    sidebar.appendChild(addSkillBtn);

    addSectionTitle(sidebar, 'Langues');
    cvData.langues.forEach((lang, idx) => {
      const div = document.createElement('div');
      div.className = 'lang-item';
      const nomSpan = document.createElement('span');
      nomSpan.className = 'lang-name';
      nomSpan.contentEditable = 'true';
      nomSpan.textContent = lang.nom;
      nomSpan.addEventListener('blur', () => {
        cvData.langues[idx].nom = nomSpan.textContent;
        saveCurrentProfile();
      });
      const select = document.createElement('select');
      select.className = 'lang-level-select';
      ['A1','A2','B1','B2','C1','C2'].forEach(n => {
        const opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        if (lang.niveau === n) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', (e) => {
        cvData.langues[idx].niveau = e.target.value;
        niveauSpan.textContent = e.target.value;
        saveCurrentProfile();
      });
      const niveauSpan = document.createElement('span');
      niveauSpan.className = 'lang-level-text';
      niveauSpan.textContent = lang.niveau;
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.className = 'delete-item-btn';
      delBtn.onclick = () => { cvData.langues.splice(idx,1); renderAll(); saveCurrentProfile(); };
      div.appendChild(nomSpan);
      div.appendChild(select);
      div.appendChild(niveauSpan);
      div.appendChild(delBtn);
      sidebar.appendChild(div);
    });
    const addLangBtn = document.createElement('button');
    addLangBtn.textContent = '+ Ajouter langue';
    addLangBtn.className = 'icon-btn';
    addLangBtn.onclick = () => { let nom = prompt('Nom:'); if(nom) { cvData.langues.push({ nom, niveau: 'B1' }); renderAll(); saveCurrentProfile(); } };
    sidebar.appendChild(addLangBtn);

    addSectionTitle(sidebar, 'Projets personnels');
    cvData.projets.forEach((proj, idx) => {
      const div = document.createElement('div');
      div.className = 'cv-project-item';
      div.innerHTML = `
        <div>
          <span class="cv-project-name" contenteditable="true">${escapeHtml(proj.nom)}</span><br>
          <span class="cv-project-desc" contenteditable="true">${escapeHtml(proj.desc)}</span>
        </div>
        <button class="delete-item-btn" data-type="projet" data-index="${idx}">🗑️</button>
      `;
      const nameSpan = div.querySelector('.cv-project-name');
      const descSpan = div.querySelector('.cv-project-desc');
      nameSpan.addEventListener('blur', () => { cvData.projets[idx].nom = nameSpan.textContent; saveCurrentProfile(); });
      descSpan.addEventListener('blur', () => { cvData.projets[idx].desc = descSpan.textContent; saveCurrentProfile(); });
      sidebar.appendChild(div);
    });
    const addProjBtn = document.createElement('button');
    addProjBtn.textContent = '+ Ajouter projet';
    addProjBtn.className = 'icon-btn';
    addProjBtn.onclick = () => {
      let nom = prompt('Nom:'); if(!nom) return;
      let desc = prompt('Description:'); if(!desc) return;
      cvData.projets.push({ nom, desc });
      renderAll(); saveCurrentProfile();
    };
    sidebar.appendChild(addProjBtn);

    addSectionTitle(sidebar, 'Intérêts / Associatif');
    const interestDiv = document.createElement('div');
    interestDiv.className = 'cv-interest';
    interestDiv.contentEditable = 'true';
    interestDiv.textContent = cvData.interets;
    interestDiv.addEventListener('blur', () => { cvData.interets = interestDiv.textContent; saveCurrentProfile(); });
    sidebar.appendChild(interestDiv);

    sidebar.querySelectorAll('.delete-item-btn[data-type]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let type = btn.dataset.type;
        let idx = parseInt(btn.dataset.index);
        if (type === 'skill') cvData.competences.splice(idx,1);
        if (type === 'projet') cvData.projets.splice(idx,1);
        if (type === 'lien') cvData.liens.splice(idx,1);
        renderAll();
        saveCurrentProfile();
        e.stopPropagation();
      });
    });
  }

  function renderMain() {
    const main = document.getElementById('cv-main');
    if (!main) return;
    main.innerHTML = '';

    const expTitle = document.createElement('div');
    expTitle.className = 'cv-section-title';
    expTitle.innerHTML = `<span>Expérience professionnelle</span><div class="section-actions"><button class="icon-btn" id="add-exp-btn">➕ Ajouter</button></div>`;
    main.appendChild(expTitle);
    const expList = document.createElement('div');
    expList.id = 'exp-list';
    expList.className = 'cv-exp-list';
    cvData.experiences.forEach((exp, idx) => {
      const item = document.createElement('div');
      item.className = 'cv-exp-item';
      item.setAttribute('data-id', exp.id || `exp_${idx}`);
      const safeBullets = (exp.bullets || []).map(b => escapeHtml(String(b)));
      item.innerHTML = `
        <div class="drag-handle">⠿</div>
        <div class="cv-exp-header">
          <span class="cv-exp-role" contenteditable="true">${escapeHtml(String(exp.role))}</span>
          <span class="cv-exp-date" contenteditable="true">${escapeHtml(String(exp.date))}</span>
        </div>
        <div class="cv-exp-org" contenteditable="true">${escapeHtml(String(exp.org))}</div>
        <ul class="cv-exp-bullets">
          ${safeBullets.map(b => `<li><button class="bullet-toggle">🙈</button><span contenteditable="true">${b}</span></li>`).join('')}
        </ul>
        <button class="delete-item-btn" data-exp-idx="${idx}" style="position:absolute; right:0; top:0;">🗑️</button>
      `;
      expList.appendChild(item);
    });
    main.appendChild(expList);

    expList.querySelectorAll('.cv-exp-role, .cv-exp-date, .cv-exp-org').forEach(el => {
      el.addEventListener('blur', () => { syncExperiencesFromDOM(); saveCurrentProfile(); });
    });
    expList.querySelectorAll('.cv-exp-bullets li').forEach(li => {
      const toggleBtn = li.querySelector('.bullet-toggle');
      const span = li.querySelector('span');
      if (toggleBtn && span) {
        if (li.classList.contains('bullet-hidden')) toggleBtn.textContent = '👁';
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          li.classList.toggle('bullet-hidden');
          toggleBtn.textContent = li.classList.contains('bullet-hidden') ? '👁' : '🙈';
          saveCurrentProfile();
        });
        span.addEventListener('blur', () => { syncExperiencesFromDOM(); saveCurrentProfile(); });
      }
    });
    expList.querySelectorAll('.delete-item-btn[data-exp-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        let idx = parseInt(btn.dataset.expIdx);
        cvData.experiences.splice(idx,1);
        renderAll();
        saveCurrentProfile();
      });
    });
    document.getElementById('add-exp-btn')?.addEventListener('click', () => {
      cvData.experiences.push({ id: Date.now().toString(), role: "Nouveau poste", org: "Entreprise", date: "MM/AAAA", bullets: ["Nouvelle réalisation"] });
      renderAll();
      saveCurrentProfile();
    });

    const eduTitle = document.createElement('div');
    eduTitle.className = 'cv-section-title';
    eduTitle.innerHTML = `<span>Études</span><div class="section-actions"><button class="icon-btn" id="add-edu-btn">➕ Ajouter</button></div>`;
    main.appendChild(eduTitle);
    const eduContainer = document.createElement('div');
    eduContainer.id = 'edu-container';
    cvData.etudes.forEach((edu, idx) => {
      const div = document.createElement('div');
      div.className = 'cv-edu-item';
      div.innerHTML = `
        <div class="edu-content">
          <div class="cv-edu-degree" contenteditable="true">${escapeHtml(String(edu.degree))}</div>
          <div class="cv-edu-school" contenteditable="true">${escapeHtml(String(edu.school))}</div>
        </div>
        <button class="delete-item-btn" data-edu-idx="${idx}">🗑️</button>
      `;
      eduContainer.appendChild(div);
    });
    main.appendChild(eduContainer);
    eduContainer.querySelectorAll('.cv-edu-degree, .cv-edu-school').forEach(el => {
      el.addEventListener('blur', () => { syncEtudesFromDOM(); saveCurrentProfile(); });
    });
    eduContainer.querySelectorAll('.delete-item-btn[data-edu-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        let idx = parseInt(btn.dataset.eduIdx);
        cvData.etudes.splice(idx,1);
        renderAll();
        saveCurrentProfile();
      });
    });
    document.getElementById('add-edu-btn')?.addEventListener('click', () => {
      cvData.etudes.push({ degree: "Nouveau diplôme", school: "Établissement, année" });
      renderAll();
      saveCurrentProfile();
    });
  }

  function syncExperiencesFromDOM() {
    const items = document.querySelectorAll('#exp-list .cv-exp-item');
    cvData.experiences = Array.from(items).map((item, idx) => ({
      id: item.dataset.id || `exp_${idx}`,
      role: item.querySelector('.cv-exp-role')?.textContent.trim() || '',
      org: item.querySelector('.cv-exp-org')?.textContent.trim() || '',
      date: item.querySelector('.cv-exp-date')?.textContent.trim() || '',
      bullets: Array.from(item.querySelectorAll('.cv-exp-bullets li span')).map(span => span.textContent.trim())
    }));
  }

  function syncEtudesFromDOM() {
    const eduDivs = document.querySelectorAll('#edu-container .cv-edu-item');
    cvData.etudes = Array.from(eduDivs).map(div => ({
      degree: div.querySelector('.cv-edu-degree')?.textContent.trim() || '',
      school: div.querySelector('.cv-edu-school')?.textContent.trim() || ''
    }));
  }

  function addSectionTitle(parent, title, storageKey) {
    const div = document.createElement('div');
    div.className = 'cv-section-title';
    const span = document.createElement('span');
    span.contentEditable = 'true';
    span.textContent = title;
    span.addEventListener('blur', () => {
      // Mettre à jour le titre dans cvData (vous devez stocker les titres)
      if (storageKey) cvData.sectionTitles[storageKey] = span.textContent;
      saveCurrentProfile();
    });
    div.appendChild(span);
    parent.appendChild(div);
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // --- Drag & Drop ---
  function toggleDrag() {
    dragMode = !dragMode;
    const btn = document.getElementById('drag-btn');
    if (btn) {
      btn.classList.toggle('tb-btn--active', dragMode);
      btn.textContent = dragMode ? '✕ Terminer' : '⠿ Réordonner';
    }
    const items = document.querySelectorAll('#exp-list .cv-exp-item');
    items.forEach(item => {
      if (dragMode) {
        item.draggable = true;
        item.classList.add('draggable');
        item.addEventListener('dragstart', onDragStart);
        item.addEventListener('dragover', onDragOver);
        item.addEventListener('dragleave', onDragLeave);
        item.addEventListener('drop', onDrop);
        item.addEventListener('dragend', onDragEnd);
      } else {
        item.draggable = false;
        item.classList.remove('draggable', 'drag-over');
        item.removeEventListener('dragstart', onDragStart);
        item.removeEventListener('dragover', onDragOver);
        item.removeEventListener('dragleave', onDragLeave);
        item.removeEventListener('drop', onDrop);
        item.removeEventListener('dragend', onDragEnd);
      }
    });
  }

  function onDragStart(e) { dragSrc = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
  function onDragOver(e) { e.preventDefault(); if (this !== dragSrc) this.classList.add('drag-over'); }
  function onDragLeave() { this.classList.remove('drag-over'); }
  function onDrop(e) {
    e.preventDefault();
    if (this === dragSrc) return;
    this.classList.remove('drag-over');
    const list = document.getElementById('exp-list');
    const items = Array.from(list.querySelectorAll('.cv-exp-item'));
    const si = items.indexOf(dragSrc);
    const di = items.indexOf(this);
    if (si < di) list.insertBefore(dragSrc, this.nextSibling);
    else list.insertBefore(dragSrc, this);
    syncExperiencesFromDOM();
    saveCurrentProfile();
  }
  function onDragEnd() { this.classList.remove('dragging'); document.querySelectorAll('.cv-exp-item').forEach(i => i.classList.remove('drag-over')); }

  // --- Thème, couleur ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
  }
  function toggleTheme() { const cur = document.documentElement.getAttribute('data-theme') || 'light'; applyTheme(cur === 'dark' ? 'light' : 'dark'); }

  function lightenColor(col, amt) {
    let hex = col.replace('#', '');
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00FF) + amt;
    let b = (num & 0x0000FF) + amt;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
  }

  function applyAccentColor(color) {
    document.documentElement.style.setProperty('--cv-accent', color);
    document.documentElement.style.setProperty('--cv-accent-light', lightenColor(color, 20));
    document.documentElement.style.setProperty('--cv-bg-header', color);
    document.documentElement.style.setProperty('--cv-section-title', color);
    document.documentElement.style.setProperty('--cv-tag-bg', color);
    const header = document.querySelector('.cv-header');
    if (header) header.style.backgroundColor = color;
    document.querySelectorAll('.cv-tag').forEach(tag => tag.style.backgroundColor = color);
  }

  function initAccentPicker() {
    const picker = document.getElementById('accent-color-picker');
    if (!picker) return;
    let savedColor = localStorage.getItem(ACCENT_KEY);
    if (!savedColor) {
      savedColor = '#2D5A3D';
      localStorage.setItem(ACCENT_KEY, savedColor);
    }
    picker.value = savedColor;
    applyAccentColor(savedColor);
    picker.addEventListener('input', (e) => {
      applyAccentColor(e.target.value);
      localStorage.setItem(ACCENT_KEY, e.target.value);
    });
  }

  // --- Impression ---
  function fitToPage() {
    const root = document.querySelector('.cv-root');
    if (!root) return;
    if (!root.dataset.originalFontSize) {
      root.dataset.originalFontSize = getComputedStyle(root).fontSize;
    }
    setTimeout(() => {
      const maxHeight = 950;
      let currentHeight = root.scrollHeight;
      if (currentHeight <= maxHeight) return;
      let factor = maxHeight / currentHeight;
      factor = Math.min(0.95, Math.max(0.6, factor));
      root.style.fontSize = `calc(${factor} * 1em)`;
      window._printFontFactor = factor;
    }, 30);
  }

  function resetPrintScale() {
    const root = document.querySelector('.cv-root');
    if (root && root.dataset.originalFontSize) {
      root.style.fontSize = '';
      delete window._printFontFactor;
    }
  }

  function downloadPDF() {
    if (dragMode) toggleDrag();
    fitToPage();
    setTimeout(() => {
      window.print();
      window.addEventListener('afterprint', () => resetPrintScale(), { once: true });
      setTimeout(resetPrintScale, 2000);
    }, 200);
  }

  // --- Import / Export ---
  function exportProfile() {
    let name = getActiveName();
    let data = captureState();
    let blob = new Blob([JSON.stringify({ name, ...data }, null, 2)], {type: 'application/json'});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cv_${name}.json`;
    a.click();
    URL.revokeObjectURL(blob);
  }

  function importProfile() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      let file = e.target.files[0];
      if (!file) return;
      let reader = new FileReader();
      reader.onload = ev => {
        try {
          let imported = JSON.parse(ev.target.result);
          let newName = imported.name || prompt('Nom du nouveau profil:', 'Importé');
          if (!newName) return;
          let profiles = getProfiles();
          profiles[newName] = imported;
          saveProfiles(profiles);
          loadProfile(newName);
          showToast('Profil importé');
        } catch(err) { showToast('Erreur JSON'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function showToast(msg) {
    let t = document.getElementById('cv-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cv-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#2D5A3D;color:#fff;font-size:12px;padding:8px 16px;border-radius:4px;opacity:0;transition:opacity 0.25s;z-index:9999;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => t.style.opacity = '0', 2800);
  }

  // --- Chargement initial ---
  async function loadDefaultJSON() {
    try {
      const response = await fetch(DEFAULT_JSON_URL);
      if (!response.ok) throw new Error();
      const defaultData = await response.json();
      if (!defaultData.infos) {
        defaultData.infos = {
          name: "Quentin Samudio",
          title: "Ingénieur Chercheur — Modélisation énergétique",
          contacts: ["quentin.samudio@yahoo.fr", "07 62 60 01 63", "Paris / Montreuil", "github.com/QuentinSamudioMines"]
        };
      }
      return defaultData;
    } catch (err) {
      console.warn('Fichier default_cv.json non trouvé, utilisation données intégrées');
      return {
        infos: {
          name: "Quentin Samudio",
          title: "Ingénieur Chercheur — Modélisation énergétique",
          contacts: ["quentin.samudio@yahoo.fr", "07 62 60 01 63", "Paris / Montreuil", "github.com/QuentinSamudioMines"]
        },
        tagline: "Ingénieur-chercheur spécialisé dans la modélisation énergétique.",
        experiences: [],
        competences: ["Python", "HTML", "CSS"],
        langues: [{ nom: "Anglais", niveau: "C1" }],
        projets: [],
        interets: "",
        liens: [],
        etudes: []
      };
    }
  }

  async function init() {
    const defaultData = await loadDefaultJSON();
    let profiles = getProfiles();
    if (Object.keys(profiles).length === 0) {
      profiles['Défaut'] = defaultData;
      saveProfiles(profiles);
    }
    renderSelect();
    loadProfile(getActiveName());
    initAccentPicker();
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
    bindEvents();
  }

  function bindEvents() {
    document.getElementById('save-profile-btn')?.addEventListener('click', saveCurrentProfile);
    document.getElementById('new-profile-btn')?.addEventListener('click', newProfile);
    document.getElementById('delete-profile-btn')?.addEventListener('click', deleteProfile);
    document.getElementById('export-profile-btn')?.addEventListener('click', exportProfile);
    document.getElementById('import-profile-btn')?.addEventListener('click', importProfile);
    document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('pdf-btn')?.addEventListener('click', downloadPDF);
    document.getElementById('drag-btn')?.addEventListener('click', toggleDrag);
    document.getElementById('profile-select')?.addEventListener('change', (e) => loadProfile(e.target.value));
    document.addEventListener('keydown', (e) => { if((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); saveCurrentProfile(); } });
  }

  window.toggleDrag = toggleDrag;
  window.toggleTheme = toggleTheme;
  window.downloadPDF = downloadPDF;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();