(function () {
  'use strict';

  var ROOT_ID = 'vuca-chamados-root';
  var STORAGE_THEME = 'vcTheme';
  var STORAGE_OPEN = 'vcOpen';
  var STORAGE_VIEW = 'vcView';
  var STORAGE_UNITS = 'vcUnitsDb';
  var VIEWS = ['tickets', 'instances', 'settings'];
  var THEMES = ['light', 'dark'];
  var MAX_UNITS_FILE_BYTES = 25 * 1024 * 1024;
  var CACHE_TTL_MS = 60 * 1000;
  var CRM_HOME = 'https://crm.vucasolution.com.br/';
  var CRM_LIST_URL = 'https://crm.vucasolution.com.br/pg_chamados.php';

  if (document.getElementById(ROOT_ID)) return;

  var parser = window.VucaChamadosParser;
  if (!parser) return;

  var ICONS = {
    ticket:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    tag:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    inbox:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    lock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    alert:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    building:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M4 21V3h11v18"/><path d="M15 9h5v12"/><path d="M2 21h20"/><path d="M8 7h3"/><path d="M8 11h3"/><path d="M8 15h3"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    upload:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M3 15v6h18v-6"/></svg>',
    file:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M14 2H5v20h14V7z"/><path d="M14 2v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>'
  };

  var THEME_LABELS = { light: 'Claro', dark: 'Escuro' };

  function themeOption(value) {
    return (
      '<label class="vc-segment">' +
      '<input type="radio" name="vc-theme" value="' + value + '" data-ref="theme-' + value + '" />' +
      '<span>' + THEME_LABELS[value] + '</span>' +
      '</label>'
    );
  }

  function railTab(view, icon, label) {
    return (
      '<button class="vc-rail-btn" id="vc-tab-' + view + '" data-view="' + view + '" type="button" role="tab" ' +
      'aria-controls="vc-view-' + view + '" aria-selected="false" tabindex="-1" aria-label="' + label + '" title="' + label + '">' +
      ICONS[icon] +
      '</button>'
    );
  }

  var TEMPLATE =
    '<div class="vc-panel" role="complementary" aria-label="Vuca Chamados">' +
    '  <nav class="vc-rail" aria-label="Seções">' +
    '    <div class="vc-rail-tabs" role="tablist" aria-orientation="vertical">' +
    railTab('tickets', 'ticket', 'Chamados') +
    railTab('instances', 'building', 'Instâncias') +
    railTab('settings', 'settings', 'Configurações') +
    '    </div>' +
    '    <button class="vc-rail-btn vc-rail-close" data-action="close" type="button" aria-label="Recolher painel" title="Recolher painel">' + ICONS.close + '</button>' +
    '  </nav>' +
    '  <div class="vc-views">' +
    /* Chamados */
    '  <section class="vc-view" id="vc-view-tickets" data-view-panel="tickets" role="tabpanel" aria-labelledby="vc-tab-tickets">' +
    '    <div class="vc-contact" aria-label="Contato atual">' +
    '      <div class="vc-contact-main">' +
    '        <div class="vc-avatar" data-ref="avatar">?</div>' +
    '        <div class="vc-contact-copy">' +
    '          <p class="vc-contact-name" data-ref="contactName">Nenhuma conversa selecionada</p>' +
    '          <p class="vc-contact-hint" data-ref="contactHint">Abra uma conversa ou informe uma instância.</p>' +
    '        </div>' +
    '      </div>' +
    '      <div class="vc-field">' +
    '        <label class="vc-field-label" for="vc-instance">Instância</label>' +
    '        <div class="vc-input-row">' +
    '          <input id="vc-instance" data-ref="instance" class="vc-input" type="text" autocomplete="off" spellcheck="false" placeholder="Ex.: universopark" />' +
    '          <button class="vc-search-btn" data-action="search" type="button" title="Buscar chamados">' +
    '            <span class="vc-search-icon" aria-hidden="true">' + ICONS.refresh + '</span>' +
    '            <span data-ref="searchLabel">Buscar</span>' +
    '          </button>' +
    '        </div>' +
    '      </div>' +
    '      <p class="vc-meta" data-ref="meta" role="status" aria-live="polite"></p>' +
    '    </div>' +
    '    <div class="vc-list" data-ref="list" aria-live="polite"></div>' +
    '  </section>' +
    /* Instâncias */
    '  <section class="vc-view" id="vc-view-instances" data-view-panel="instances" role="tabpanel" aria-labelledby="vc-tab-instances" hidden>' +
    '    <div class="vc-contact" data-ref="unitSearchBar" hidden>' +
    '      <div class="vc-field">' +
    '        <label class="vc-field-label" for="vc-unit-search">Buscar unidade</label>' +
    '        <input id="vc-unit-search" data-ref="unitSearch" class="vc-input" type="search" autocomplete="off" spellcheck="false" placeholder="Nome da unidade ou instância" />' +
    '      </div>' +
    '      <p class="vc-meta" data-ref="unitMeta" role="status" aria-live="polite"></p>' +
    '    </div>' +
    '    <div class="vc-list" data-ref="instancesBody"></div>' +
    '  </section>' +
    /* Configurações */
    '  <section class="vc-view" id="vc-view-settings" data-view-panel="settings" role="tabpanel" aria-labelledby="vc-tab-settings" hidden>' +
    '    <div class="vc-view-head"><h2 class="vc-view-title">Configurações</h2></div>' +
    '    <div class="vc-scroll">' +
    '      <fieldset class="vc-group">' +
    '        <legend class="vc-group-title">Tema</legend>' +
    '        <div class="vc-segments">' + themeOption('light') + themeOption('dark') + '</div>' +
    '      </fieldset>' +
    '      <div class="vc-group">' +
    '        <h3 class="vc-group-title" id="vc-units-title">Base de unidades</h3>' +
    '        <p class="vc-group-text">Arquivo HTML com todas as unidades do Vuca. Ele fica salvo só neste navegador e alimenta a verificação de instâncias.</p>' +
    '        <div class="vc-db" data-ref="dbCard"></div>' +
    '        <input class="vc-file-input" id="vc-units-file" data-ref="unitsFile" type="file" accept=".html,.htm,text/html" aria-labelledby="vc-units-title" />' +
    '        <div class="vc-db-actions">' +
    '          <label class="vc-btn vc-btn--primary" for="vc-units-file" data-ref="unitsPick">' + ICONS.upload + '<span data-ref="unitsPickLabel">Enviar arquivo HTML</span></label>' +
    '          <button class="vc-btn" data-action="clear-units" data-ref="unitsClear" type="button" hidden>Remover base</button>' +
    '        </div>' +
    '        <p class="vc-field-error" data-ref="unitsError" role="alert"></p>' +
    '      </div>' +
    '    </div>' +
    '  </section>' +
    '  </div>' +
    '</div>' +
    '<button class="vc-tab" data-action="open" type="button" aria-label="Abrir chamados" title="Abrir chamados">' +
    '  <span class="vc-tab-icon" aria-hidden="true">' + ICONS.ticket + '</span>' +
    '  <span class="vc-tab-label">Chamados</span>' +
    '</button>';

  var host = document.createElement('div');
  host.id = ROOT_ID;
  host.style.cssText = 'position:fixed;inset:0;width:0;height:0;z-index:2147483647;';
  host.style.display = isChatRoute() ? '' : 'none';
  document.documentElement.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });
  var styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('sidebar.css');
  shadow.appendChild(styleLink);

  var app = document.createElement('div');
  app.className = 'vc-app';
  app.dataset.theme = 'light';
  app.innerHTML = TEMPLATE;
  app.style.visibility = 'hidden';
  shadow.appendChild(app);

  var stylesReady = false;
  function revealApp() {
    if (stylesReady) return;
    stylesReady = true;
    app.style.visibility = '';
  }
  styleLink.addEventListener('load', revealApp);
  styleLink.addEventListener('error', revealApp);
  window.setTimeout(revealApp, 1000);

  var refs = {
    panel: app.querySelector('.vc-panel'),
    tab: app.querySelector('.vc-tab'),
    avatar: app.querySelector('[data-ref="avatar"]'),
    contactName: app.querySelector('[data-ref="contactName"]'),
    contactHint: app.querySelector('[data-ref="contactHint"]'),
    instance: app.querySelector('[data-ref="instance"]'),
    searchBtn: app.querySelector('[data-action="search"]'),
    searchLabel: app.querySelector('[data-ref="searchLabel"]'),
    meta: app.querySelector('[data-ref="meta"]'),
    list: app.querySelector('[data-ref="list"]'),
    closeBtn: app.querySelector('[data-action="close"]'),
    openBtn: app.querySelector('[data-action="open"]'),
    railTabs: Array.prototype.slice.call(app.querySelectorAll('.vc-rail-btn[data-view]')),
    viewPanels: Array.prototype.slice.call(app.querySelectorAll('[data-view-panel]')),
    themeInputs: Array.prototype.slice.call(app.querySelectorAll('input[name="vc-theme"]')),
    instancesBody: app.querySelector('[data-ref="instancesBody"]'),
    unitSearchBar: app.querySelector('[data-ref="unitSearchBar"]'),
    unitSearch: app.querySelector('[data-ref="unitSearch"]'),
    unitMeta: app.querySelector('[data-ref="unitMeta"]'),
    dbCard: app.querySelector('[data-ref="dbCard"]'),
    unitsFile: app.querySelector('[data-ref="unitsFile"]'),
    unitsPickLabel: app.querySelector('[data-ref="unitsPickLabel"]'),
    unitsClear: app.querySelector('[data-ref="unitsClear"]'),
    unitsError: app.querySelector('[data-ref="unitsError"]')
  };

  var state = {
    open: true,
    theme: 'light',
    themePref: 'light',
    view: 'tickets',
    units: null,
    unitsIndex: null,
    unitsBusy: false,
    contactName: '',
    detectedName: '',
    instance: '',
    instanceDirty: false,
    loading: false,
    activeRequestInstance: '',
    requestSeq: 0,
    lastUpdated: null,
    loadedInstance: '',
    lastAutoInstance: '',
    emptyHits: 0,
    routeActive: false,
    cache: new Map()
  };

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function isChatRoute() {
    return /^\/chat(?:\/|$)/.test(window.location.pathname);
  }

  function formatTime(date) {
    try {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  }

  function formatCount(count) {
    return count === 1 ? '1 chamado' : count + ' chamados';
  }

  function statusTone(status) {
    var value = parser.normalize(status);
    if (!value) return 'neutral';
    if (/(finalizado|fechado|concluido|resolvido|encerrado)/.test(value)) return 'success';
    if (/(em analise|analise|andamento|aberto|atendimento|novo|em execucao)/.test(value)) return 'open';
    if (/(aguardando|pendente|previsao|pausado|em espera)/.test(value)) return 'waiting';
    if (/(cancelado|reprovado|recusado|erro)/.test(value)) return 'danger';
    return 'neutral';
  }

  function storeGet(keys, callback) {
    try {
      chrome.storage.local.get(keys, function (data) {
        if (chrome.runtime.lastError) {
          callback({});
          return;
        }
        callback(data || {});
      });
    } catch (err) {
      callback({});
    }
  }

  function storeSet(values) {
    try {
      chrome.storage.local.set(values);
    } catch (err) {
      /* armazenamento indisponível */
    }
  }

  function pageIsDark() {
    var root = document.documentElement;
    if (root.classList.contains('dark')) return true;
    var attr = root.getAttribute('data-theme') || (document.body && document.body.getAttribute('data-theme')) || '';
    return /dark/i.test(attr);
  }

  function applyThemePref(pref, persist) {
    state.themePref = THEMES.indexOf(pref) !== -1 ? pref : 'light';
    state.theme = state.themePref;
    app.dataset.theme = state.theme;
    for (var i = 0; i < refs.themeInputs.length; i++) {
      refs.themeInputs[i].checked = refs.themeInputs[i].value === state.themePref;
    }

    if (persist) {
      var values = {};
      values[STORAGE_THEME] = state.themePref;
      storeSet(values);
    }
  }

  function initTheme() {
    /* Sem escolha salva (ou com o antigo "auto"), parte do modo atual do Sendi. */
    applyThemePref(pageIsDark() ? 'dark' : 'light', false);
    storeGet([STORAGE_THEME], function (data) {
      if (THEMES.indexOf(data[STORAGE_THEME]) !== -1) applyThemePref(data[STORAGE_THEME], false);
    });
  }

  function setView(view, persist, focusTab) {
    state.view = VIEWS.indexOf(view) !== -1 ? view : 'tickets';

    for (var i = 0; i < refs.railTabs.length; i++) {
      var tab = refs.railTabs[i];
      var active = tab.dataset.view === state.view;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    }
    for (var j = 0; j < refs.viewPanels.length; j++) {
      refs.viewPanels[j].hidden = refs.viewPanels[j].dataset.viewPanel !== state.view;
    }

    if (state.view === 'instances') renderInstances();

    if (persist) {
      var values = {};
      values[STORAGE_VIEW] = state.view;
      storeSet(values);
    }
  }

  function setOpen(open, persist) {
    state.open = Boolean(open);
    app.classList.toggle('vc-collapsed', !state.open);
    refs.panel.setAttribute('aria-hidden', state.open ? 'false' : 'true');
    refs.tab.setAttribute('aria-hidden', state.open ? 'true' : 'false');
    refs.panel.inert = !state.open;
    refs.tab.inert = state.open;

    if (persist) {
      var values = {};
      values[STORAGE_OPEN] = state.open;
      storeSet(values);
    }

    if (state.open) {
      if (isChatRoute()) refreshContact(false);
      if (state.instance) maybeAutoFetch(state.instance);
    }
  }

  function updateSearchState() {
    var hasInstance = clean(refs.instance.value) !== '';
    refs.searchBtn.disabled = state.loading || !hasInstance;
    refs.searchBtn.classList.toggle('vc-loading', state.loading);
    refs.searchLabel.textContent = state.loading ? 'Buscando' : 'Buscar';
  }

  function updateMeta(text) {
    refs.meta.textContent = text || '';
  }

  function isGenericName(text) {
    var value = clean(text);
    var normalized = parser.normalize(value);
    if (!normalized) return true;
    if (/^(dados do contato|contato do atendimento|abrir painel da conversa|voltar para a lista de conversas|sem nome|desconhecido)$/.test(normalized)) {
      return true;
    }
    if (normalized.indexOf('dados do contato') !== -1) return true;
    if (normalized.indexOf('atendimento aberto por') === 0) return true;
    return false;
  }

  function pickContactName() {
    var buttons = document.querySelectorAll(
      'button[aria-label="Contato do atendimento"], button[aria-label="Abrir painel da conversa"]'
    );

    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      if (!parser.isVisible(button)) continue;
      var paragraphs = button.querySelectorAll('p');
      for (var j = 0; j < paragraphs.length; j++) {
        var text = clean(paragraphs[j].textContent);
        if (text && !isGenericName(text) && text.length <= 160) return text;
      }
    }

    var asides = document.querySelectorAll('aside[aria-label="Dados do contato"]');
    for (var a = 0; a < asides.length; a++) {
      var aside = asides[a];
      if (!parser.isVisible(aside)) continue;

      var input = aside.querySelector('input[placeholder="Nome do contato"]');
      if (input && clean(input.value)) return clean(input.value);

      var ps = aside.querySelectorAll('p');
      var candidate = '';
      for (var p = 0; p < ps.length; p++) {
        var value = clean(ps[p].textContent);
        if (!value || isGenericName(value) || value.length > 160) continue;
        if (value.indexOf('-') !== -1) return value;
        if (!candidate && !/^\+?\d/.test(value)) candidate = value;
      }
      if (candidate) return candidate;
    }

    return '';
  }

  function getCached(instance) {
    var entry = state.cache.get(instance);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      state.cache.delete(instance);
      return null;
    }
    return entry;
  }

  function cancelLoading() {
    state.requestSeq += 1;
    state.loading = false;
    state.activeRequestInstance = '';
    updateSearchState();
  }

  function maybeAutoFetch(instance) {
    var value = clean(instance);
    if (!value) return;
    if (state.loading && state.activeRequestInstance === value) return;
    if (state.lastAutoInstance === value && state.loadedInstance === value) return;

    var cached = getCached(value);
    if (cached) {
      state.tickets = cached.tickets;
      state.loadedInstance = value;
      state.lastUpdated = new Date(cached.ts);
      state.lastAutoInstance = value;
      renderTickets(cached.tickets, value, state.lastUpdated);
      return;
    }

    state.lastAutoInstance = value;
    fetchTickets(value, true);
  }

  function applyContact(name) {
    var instance = name ? parser.extractInstance(name) : '';
    var previousInstance = state.instance;

    state.contactName = name;
    state.instance = instance;
    state.instanceDirty = false;

    refs.contactName.textContent = name || 'Nenhuma conversa selecionada';
    refs.contactName.title = name || '';
    refs.contactHint.textContent = name
      ? instance
        ? 'Contato atual'
        : 'Não foi possível identificar a instância no nome do contato.'
      : 'Abra uma conversa ou informe uma instância.';
    refs.avatar.textContent = name ? clean(name).charAt(0).toUpperCase() : '?';
    refs.avatar.classList.toggle('vc-avatar-empty', !name);

    if (name) {
      refs.instance.value = instance;
    } else if (!state.instanceDirty) {
      refs.instance.value = '';
    }

    updateSearchState();

    if (name && instance) {
      if (previousInstance !== instance) {
        state.loadedInstance = '';
        state.lastUpdated = null;
        state.lastAutoInstance = '';
        var cached = getCached(instance);
        if (cached) {
          state.tickets = cached.tickets;
          state.loadedInstance = instance;
          state.lastUpdated = new Date(cached.ts);
          state.lastAutoInstance = instance;
          renderTickets(cached.tickets, instance, state.lastUpdated);
        } else {
          renderLoadingSkeletons();
          updateMeta('Buscando chamados...');
        }
      }
      if (state.open) maybeAutoFetch(instance);
    } else if (name) {
      clearTickets('no-instance');
    } else {
      clearTickets('no-contact');
    }
  }

  function refreshContact(force) {
    if (!isChatRoute()) return;

    var name = pickContactName();
    if (name) {
      state.emptyHits = 0;
      if (name !== state.detectedName) {
        state.detectedName = name;
        applyContact(name);
      }
      return;
    }

    state.emptyHits = Math.min(state.emptyHits + 1, 3);
    if (force || state.emptyHits >= 3) {
      if (state.detectedName) {
        state.detectedName = '';
        applyContact('');
      }
    }
  }

  function syncRoute() {
    var active = isChatRoute();
    if (active === state.routeActive) return;
    state.routeActive = active;
    host.style.display = active ? '' : 'none';

    if (active) {
      refreshContact(true);
      if (state.open && state.instance) maybeAutoFetch(state.instance);
    }
  }

  function iconElement(name, className) {
    var wrapper = document.createElement('span');
    wrapper.className = className;
    wrapper.innerHTML = ICONS[name] || ICONS.inbox;
    return wrapper;
  }

  function buildChip(iconName, text) {
    var chip = document.createElement('span');
    chip.className = 'vc-chip';
    chip.appendChild(iconElement(iconName, 'vc-chip-icon'));
    var label = document.createElement('span');
    label.textContent = text;
    chip.appendChild(label);
    return chip;
  }

  function buildTicket(ticket) {
    var article = document.createElement('article');
    article.className = 'vc-ticket';

    var top = document.createElement('div');
    top.className = 'vc-ticket-top';

    var link = document.createElement('a');
    link.className = 'vc-ticket-number';
    link.href = ticket.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = 'Abrir chamado no CRM';
    link.appendChild(document.createTextNode('#' + ticket.numero));
    link.appendChild(iconElement('external', 'vc-ticket-number-icon'));

    var status = document.createElement('span');
    status.className = 'vc-status vc-status--' + statusTone(ticket.status);
    status.textContent = ticket.status || 'Sem status';
    status.title = ticket.status || '';

    top.appendChild(link);
    top.appendChild(status);

    var functionality = document.createElement('p');
    functionality.className = 'vc-ticket-function';
    functionality.textContent = ticket.funcionalidade || 'Funcionalidade não informada';
    functionality.title = ticket.funcionalidade || '';

    var meta = document.createElement('div');
    meta.className = 'vc-ticket-meta';
    if (ticket.tipo) meta.appendChild(buildChip('tag', ticket.tipo));
    if (ticket.data) meta.appendChild(buildChip('calendar', ticket.data));

    article.appendChild(top);
    article.appendChild(functionality);
    if (meta.childNodes.length) article.appendChild(meta);
    return article;
  }

  function buildState(options) {
    var box = document.createElement('div');
    box.className = 'vc-state';
    box.appendChild(iconElement(options.icon || 'inbox', 'vc-state-icon'));

    var title = document.createElement('p');
    title.className = 'vc-state-title';
    title.textContent = options.title || '';
    box.appendChild(title);

    var text = document.createElement('p');
    text.className = 'vc-state-text';
    text.textContent = options.description || '';
    box.appendChild(text);

    if (options.actions && options.actions.length) {
      var actions = document.createElement('div');
      actions.className = 'vc-state-actions';

      for (var i = 0; i < options.actions.length; i++) {
        var action = options.actions[i];
        if (action.href) {
          var link = document.createElement('a');
          link.className = 'vc-secondary';
          link.href = action.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = action.label;
          actions.appendChild(link);
        } else {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'vc-secondary';
          button.textContent = action.label;
          button.addEventListener('click', action.onClick);
          actions.appendChild(button);
        }
      }
      box.appendChild(actions);
    }

    return box;
  }

  function renderLoadingSkeletons() {
    refs.list.replaceChildren();
    for (var i = 0; i < 3; i++) {
      var card = document.createElement('div');
      card.className = 'vc-skeleton';
      var line1 = document.createElement('div');
      line1.className = 'vc-skeleton-line vc-skeleton-line--short';
      var line2 = document.createElement('div');
      line2.className = 'vc-skeleton-line';
      var line3 = document.createElement('div');
      line3.className = 'vc-skeleton-line vc-skeleton-line--tiny';
      card.appendChild(line1);
      card.appendChild(line2);
      card.appendChild(line3);
      refs.list.appendChild(card);
    }
  }

  function renderTickets(tickets, instance, date) {
    refs.list.replaceChildren();

    if (!tickets.length) {
      refs.list.appendChild(
        buildState({
          icon: 'inbox',
          title: 'Nenhum chamado encontrado',
          description: 'Não encontramos chamados para a instância "' + instance + '".'
        })
      );
      updateMeta('Nenhum chamado.');
      return;
    }

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < tickets.length; i++) fragment.appendChild(buildTicket(tickets[i]));
    refs.list.appendChild(fragment);
    updateMeta(formatCount(tickets.length) + ' · Atualizado às ' + formatTime(date));
  }

  function crmUrlFor(instance) {
    var value = clean(instance);
    return value ? CRM_LIST_URL + '?instancia=' + encodeURIComponent(value) : CRM_HOME;
  }

  function clearTickets(reason) {
    cancelLoading();
    state.tickets = [];
    state.lastUpdated = null;
    state.loadedInstance = '';
    state.lastAutoInstance = '';
    refs.list.replaceChildren();

    if (reason === 'no-instance') {
      refs.list.appendChild(
        buildState({
          icon: 'alert',
          title: 'Instância não identificada',
          description:
            "O nome do contato não contém uma instância no formato 'Nome - instância'. Informe a instância acima e toque em Buscar."
        })
      );
      updateMeta('Informe a instância para buscar.');
      return;
    }

    refs.list.appendChild(
      buildState({
        icon: 'inbox',
        title: 'Nenhuma conversa selecionada',
        description: 'Abra uma conversa no Sendi para carregar os chamados da unidade.'
      })
    );
    updateMeta('Aguardando contato.');
  }

  function showAuthRequired(instance) {
    var current = clean(refs.instance.value) || instance;
    refs.list.replaceChildren(
      buildState({
        icon: 'lock',
        title: 'Acesso ao CRM',
        description:
          'Entre no CRM Vuca para consultar os chamados desta unidade. Depois, toque em Tentar novamente.',
        actions: [
          { label: 'Abrir CRM', href: crmUrlFor(current) },
          { label: 'Tentar novamente', onClick: function () { fetchTickets(clean(refs.instance.value) || instance, true); } }
        ]
      })
    );
    updateMeta('Login no CRM necessário.');
  }

  function showCloudflare(instance, message) {
    var current = clean(refs.instance.value) || instance;
    refs.list.replaceChildren(
      buildState({
        icon: 'alert',
        title: 'Verificação do CRM',
        description:
          message ||
          'O CRM pediu uma verificação do Cloudflare. Abra o CRM em uma aba, conclua a verificação e tente novamente.',
        actions: [
          { label: 'Abrir CRM', href: crmUrlFor(current) },
          { label: 'Tentar novamente', onClick: function () { fetchTickets(clean(refs.instance.value) || instance, true); } }
        ]
      })
    );
    updateMeta('Verificação necessária.');
  }

  function showError(message) {
    var instance = clean(refs.instance.value);
    refs.list.replaceChildren(
      buildState({
        icon: 'alert',
        title: 'Não foi possível buscar',
        description: message || 'Ocorreu um erro ao consultar os chamados.',
        actions: [
          { label: 'Tentar novamente', onClick: function () { fetchTickets(instance, true); } }
        ]
      })
    );
    updateMeta('Falha na consulta.');
  }

  function fetchTickets(instance, manual) {
    var value = clean(instance);
    if (!value) {
      refs.instance.focus();
      return;
    }

    var requestId = state.requestSeq + 1;
    state.requestSeq = requestId;
    state.loading = true;
    state.activeRequestInstance = value;

    if (state.loadedInstance !== value) renderLoadingSkeletons();
    updateSearchState();
    updateMeta('Buscando chamados...');

    try {
      chrome.runtime.sendMessage({ type: 'vc:fetchTickets', instancia: value }, function (response) {
        if (requestId !== state.requestSeq) return;

        state.loading = false;
        state.activeRequestInstance = '';
        updateSearchState();

        if (chrome.runtime.lastError) {
          showError('Não foi possível falar com a extensão. Recarregue a página e tente novamente.');
          return;
        }
        if (!response) {
          showError('A extensão não respondeu. Recarregue a página e tente novamente.');
          return;
        }
        if (!response.ok) {
          if (response.authRequired) {
            showAuthRequired(value);
            return;
          }
          if (response.cloudflare) {
            showCloudflare(value, response.error);
            return;
          }
          showError(response.error || 'Não foi possível consultar os chamados.');
          return;
        }

        var pageInfo = parser.inspectPage(response.html, response.url);
        if (pageInfo.authRequired) {
          showAuthRequired(value);
          return;
        }
        if (pageInfo.cloudflare) {
          showCloudflare(value);
          return;
        }

        var tickets;
        try {
          tickets = parser.parseTickets(response.html);
        } catch (err) {
          showError('Falha ao interpretar a resposta do CRM.');
          return;
        }

        var entry = { ts: Date.now(), tickets: tickets };
        state.cache.set(value, entry);

        if (value !== clean(refs.instance.value)) return;

        state.loadedInstance = value;
        state.lastUpdated = new Date(entry.ts);
        state.lastAutoInstance = value;
        renderTickets(tickets, value, state.lastUpdated);
      });
    } catch (err) {
      state.loading = false;
      state.activeRequestInstance = '';
      updateSearchState();
      showError('Não foi possível falar com a extensão. Recarregue a página e tente novamente.');
    }
  }

  /* ---------- Base de unidades ---------- */

  function formatDateTime(ts) {
    try {
      return new Date(ts).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
  }

  function formatUnits(count) {
    return count === 1 ? '1 unidade' : count.toLocaleString('pt-BR') + ' unidades';
  }

  function setUnitsError(text) {
    refs.unitsError.textContent = text || '';
  }

  function dbRow(label, value) {
    var row = document.createElement('div');
    row.className = 'vc-db-row';
    var dt = document.createElement('dt');
    dt.textContent = label;
    var dd = document.createElement('dd');
    dd.textContent = value;
    dd.title = value;
    row.appendChild(dt);
    row.appendChild(dd);
    return row;
  }

  function renderUnitsDb() {
    var db = state.units;
    refs.dbCard.replaceChildren();
    refs.dbCard.classList.toggle('vc-db--empty', !db);
    refs.unitsClear.hidden = !db;
    refs.unitsPickLabel.textContent = state.unitsBusy
      ? 'Lendo arquivo'
      : db ? 'Substituir arquivo' : 'Enviar arquivo HTML';

    if (!db) {
      refs.dbCard.appendChild(iconElement('file', 'vc-db-icon'));
      var empty = document.createElement('p');
      empty.className = 'vc-db-empty';
      empty.textContent = 'Nenhuma base importada.';
      refs.dbCard.appendChild(empty);
      return;
    }

    var list = document.createElement('dl');
    list.className = 'vc-db-list';
    list.appendChild(dbRow('Arquivo', db.fileName + (db.size ? ' · ' + formatBytes(db.size) : '')));
    list.appendChild(dbRow('Unidades', formatUnits(db.rows.length)));
    if (db.headers && db.headers.length) list.appendChild(dbRow('Colunas', db.headers.filter(Boolean).join(', ')));
    list.appendChild(dbRow('Importada', formatDateTime(db.importedAt)));
    refs.dbCard.appendChild(list);
  }

  function cellAt(row, index) {
    return index >= 0 && row[index] != null ? clean(row[index]) : '';
  }

  /* Agrupa as linhas da base por instância, em ordem alfabética. */
  function buildUnitsIndex(db) {
    var cols = parser.unitColumns(db.headers);
    var instanceCol = cols.instanceColumn;
    var nameCol = cols.nameColumn;
    if (instanceCol === -1 && typeof db.instanceColumn === 'number') instanceCol = db.instanceColumn;
    if (nameCol === -1 && typeof db.nameColumn === 'number') nameCol = db.nameColumn;

    var groups = new Map();
    for (var i = 0; i < db.rows.length; i++) {
      var row = db.rows[i];
      var instance = cellAt(row, instanceCol) || 'Sem instância';
      var unit = {
        id: cellAt(row, cols.idColumn),
        name: cellAt(row, nameCol) || 'Unidade sem nome'
      };
      unit.key = parser.normalize(unit.name);

      var key = parser.normalize(instance);
      var group = groups.get(key);
      if (!group) {
        group = { instance: instance, key: key, units: [] };
        groups.set(key, group);
      }
      group.units.push(unit);
    }

    var list = Array.from(groups.values());
    list.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });
    for (var g = 0; g < list.length; g++) {
      list[g].units.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });
    }
    return { importedAt: db.importedAt, groups: list, total: db.rows.length };
  }

  function getUnitsIndex() {
    var db = state.units;
    if (!db) return null;
    if (!state.unitsIndex || state.unitsIndex.importedAt !== db.importedAt) {
      state.unitsIndex = buildUnitsIndex(db);
    }
    return state.unitsIndex;
  }

  function buildInstanceCard(group, units) {
    var article = document.createElement('article');
    article.className = 'vc-ticket vc-unit-card';

    var top = document.createElement('div');
    top.className = 'vc-ticket-top';
    var name = document.createElement('p');
    name.className = 'vc-unit-instance';
    name.textContent = group.instance;
    name.title = group.instance;
    var count = document.createElement('span');
    count.className = 'vc-unit-count';
    count.textContent = formatUnits(units.length);
    top.appendChild(name);
    top.appendChild(count);
    article.appendChild(top);

    var list = document.createElement('ul');
    list.className = 'vc-unit-list';
    for (var i = 0; i < units.length; i++) {
      var item = document.createElement('li');
      item.className = 'vc-unit-item';
      var label = document.createElement('span');
      label.className = 'vc-unit-name';
      label.textContent = units[i].name;
      label.title = units[i].name;
      item.appendChild(label);
      if (units[i].id) {
        var id = document.createElement('span');
        id.className = 'vc-unit-id';
        id.textContent = '#' + units[i].id;
        item.appendChild(id);
      }
      list.appendChild(item);
    }
    article.appendChild(list);
    return article;
  }

  /*
   * A base completa tem mais de mil unidades: os cards são montados em lotes
   * conforme a lista rola, para a busca responder sem travar o Sendi.
   */
  var UNIT_BATCH = 60;
  var unitPaging = { matches: [], shown: 0, sentinel: null, observer: null };

  function appendInstanceBatch() {
    var end = Math.min(unitPaging.shown + UNIT_BATCH, unitPaging.matches.length);
    if (end <= unitPaging.shown) return;

    var fragment = document.createDocumentFragment();
    for (var i = unitPaging.shown; i < end; i++) {
      fragment.appendChild(buildInstanceCard(unitPaging.matches[i].group, unitPaging.matches[i].units));
    }
    unitPaging.shown = end;

    if (unitPaging.sentinel) unitPaging.sentinel.remove();
    refs.instancesBody.appendChild(fragment);

    if (unitPaging.shown < unitPaging.matches.length) {
      if (!unitPaging.sentinel) {
        unitPaging.sentinel = document.createElement('div');
        unitPaging.sentinel.className = 'vc-sentinel';
        unitPaging.sentinel.setAttribute('aria-hidden', 'true');
      }
      refs.instancesBody.appendChild(unitPaging.sentinel);
      if (!unitPaging.observer) {
        unitPaging.observer = new IntersectionObserver(function (entries) {
          if (entries[0] && entries[0].isIntersecting) appendInstanceBatch();
        }, { root: refs.instancesBody, rootMargin: '600px 0px' });
      }
      unitPaging.observer.observe(unitPaging.sentinel);
    }
  }

  function renderInstanceList() {
    var index = getUnitsIndex();
    if (!index) return;

    var query = parser.normalize(refs.unitSearch.value);
    var matches = [];
    var instances = 0;
    var units = 0;

    for (var g = 0; g < index.groups.length; g++) {
      var group = index.groups[g];
      var matched = group.units;
      if (query && group.key.indexOf(query) === -1) {
        matched = group.units.filter(function (unit) { return unit.key.indexOf(query) !== -1; });
      }
      if (!matched.length) continue;
      instances += 1;
      units += matched.length;
      matches.push({ group: group, units: matched });
    }

    if (unitPaging.observer) unitPaging.observer.disconnect();
    unitPaging.matches = matches;
    unitPaging.shown = 0;
    refs.instancesBody.replaceChildren();
    refs.instancesBody.scrollTop = 0;

    if (!instances) {
      refs.instancesBody.appendChild(
        buildState({
          icon: 'building',
          title: 'Nenhuma unidade encontrada',
          description: 'Nada na base corresponde a "' + clean(refs.unitSearch.value) + '".'
        })
      );
      refs.unitMeta.textContent = 'Nenhum resultado.';
      return;
    }

    appendInstanceBatch();
    refs.unitMeta.textContent =
      (instances === 1 ? '1 instância' : instances.toLocaleString('pt-BR') + ' instâncias') +
      ' · ' + formatUnits(units) +
      (query ? ' de ' + index.total.toLocaleString('pt-BR') : '');
  }

  function renderInstances() {
    var db = state.units;
    refs.unitSearchBar.hidden = !db;

    if (!db) {
      state.unitsIndex = null;
      refs.unitSearch.value = '';
      refs.instancesBody.replaceChildren(
        buildState({
          icon: 'building',
          title: 'Base de unidades não importada',
          description: 'Envie o arquivo HTML com as unidades do Vuca em Configurações para listar as instâncias.',
          actions: [{ label: 'Abrir configurações', onClick: function () { setView('settings', true, true); } }]
        })
      );
      return;
    }

    renderInstanceList();
  }

  function loadUnitsDb() {
    storeGet([STORAGE_UNITS], function (data) {
      var db = data[STORAGE_UNITS];
      state.units = db && Array.isArray(db.rows) ? db : null;
      renderUnitsDb();
      if (state.view === 'instances') renderInstances();
    });
  }

  function importUnitsFile(file) {
    setUnitsError('');
    if (!file) return;

    if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') {
      setUnitsError('Escolha um arquivo .html ou .htm.');
      return;
    }
    if (file.size > MAX_UNITS_FILE_BYTES) {
      setUnitsError('O arquivo passa de 25 MB.');
      return;
    }

    state.unitsBusy = true;
    renderUnitsDb();

    var reader = new FileReader();
    reader.onerror = function () {
      state.unitsBusy = false;
      renderUnitsDb();
      setUnitsError('Não foi possível ler o arquivo.');
    };
    reader.onload = function () {
      var parsed;
      try {
        parsed = parser.parseUnits(String(reader.result || ''));
      } catch (err) {
        parsed = null;
      }

      state.unitsBusy = false;
      if (!parsed || !parsed.rows.length) {
        renderUnitsDb();
        setUnitsError('Nenhuma tabela de unidades encontrada no arquivo.');
        return;
      }

      var db = {
        version: 1,
        fileName: file.name,
        size: file.size,
        importedAt: Date.now(),
        headers: parsed.headers,
        rows: parsed.rows,
        instanceColumn: parsed.instanceColumn,
        nameColumn: parsed.nameColumn
      };

      var values = {};
      values[STORAGE_UNITS] = db;
      try {
        chrome.storage.local.set(values, function () {
          if (chrome.runtime.lastError) {
            renderUnitsDb();
            setUnitsError('Não foi possível salvar a base: ' + chrome.runtime.lastError.message);
            return;
          }
          state.units = db;
          renderUnitsDb();
          if (state.view === 'instances') renderInstances();
        });
      } catch (err) {
        renderUnitsDb();
        setUnitsError('Não foi possível salvar a base.');
      }
    };
    reader.readAsText(file);
  }

  function clearUnitsDb() {
    setUnitsError('');
    try {
      chrome.storage.local.remove(STORAGE_UNITS);
    } catch (err) {
      /* armazenamento indisponível */
    }
    state.units = null;
    renderUnitsDb();
    if (state.view === 'instances') renderInstances();
  }

  var contactTimer = 0;
  function scheduleContactCheck() {
    if (contactTimer) return;
    contactTimer = window.setTimeout(function () {
      contactTimer = 0;
      if (isChatRoute()) refreshContact(false);
    }, 400);
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    syncRoute();
    refreshContact(true);

    var observer = new MutationObserver(scheduleContactCheck);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.addEventListener('focus', function () { refreshContact(false); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) refreshContact(false);
    });
    window.setInterval(function () {
      syncRoute();
      if (isChatRoute()) refreshContact(false);
    }, 2000);
  }

  refs.searchBtn.addEventListener('click', function () {
    var instance = clean(refs.instance.value);
    if (!instance) {
      refs.instance.focus();
      return;
    }
    fetchTickets(instance, true);
  });

  refs.instance.addEventListener('input', function () {
    var next = clean(refs.instance.value);
    state.instance = next;
    state.instanceDirty = true;

    if (state.loading && state.activeRequestInstance && state.activeRequestInstance !== next) {
      cancelLoading();
    }

    updateSearchState();

    if (state.loadedInstance !== next) {
      updateMeta(next ? 'Instância alterada. Busque os chamados para atualizar.' : 'Informe uma instância para buscar.');
    }
  });

  refs.instance.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      refs.searchBtn.click();
    }
  });

  refs.closeBtn.addEventListener('click', function () {
    setOpen(false, true);
  });

  refs.openBtn.addEventListener('click', function () {
    setOpen(true, true);
  });

  for (var t = 0; t < refs.railTabs.length; t++) {
    refs.railTabs[t].addEventListener('click', function (event) {
      setView(event.currentTarget.dataset.view, true, false);
    });
    refs.railTabs[t].addEventListener('keydown', function (event) {
      var index = VIEWS.indexOf(event.currentTarget.dataset.view);
      var next = -1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % VIEWS.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + VIEWS.length) % VIEWS.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = VIEWS.length - 1;
      if (next === -1) return;
      event.preventDefault();
      setView(VIEWS[next], true, true);
    });
  }

  for (var r = 0; r < refs.themeInputs.length; r++) {
    refs.themeInputs[r].addEventListener('change', function (event) {
      if (event.currentTarget.checked) applyThemePref(event.currentTarget.value, true);
    });
  }

  refs.unitsFile.addEventListener('change', function () {
    var file = refs.unitsFile.files && refs.unitsFile.files[0];
    importUnitsFile(file);
    refs.unitsFile.value = '';
  });

  refs.unitsClear.addEventListener('click', clearUnitsDb);

  var unitSearchTimer = 0;
  refs.unitSearch.addEventListener('input', function () {
    window.clearTimeout(unitSearchTimer);
    unitSearchTimer = window.setTimeout(renderInstanceList, 120);
  });

  initTheme();
  setOpen(true, false);
  setView('tickets', false, false);
  loadUnitsDb();

  storeGet([STORAGE_OPEN, STORAGE_VIEW], function (data) {
    if (typeof data[STORAGE_VIEW] === 'string') setView(data[STORAGE_VIEW], false, false);
    if (typeof data[STORAGE_OPEN] === 'boolean') setOpen(data[STORAGE_OPEN], false);
    start();
  });
  window.setTimeout(start, 1200);
})();
