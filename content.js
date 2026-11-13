(function () {
  'use strict';

  var ROOT_ID = 'vuca-chamados-root';
  var STORAGE_THEME = 'vcTheme';
  var STORAGE_OPEN = 'vcOpen';
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
    moon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    sun:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
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
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
  };

  var TEMPLATE =
    '<div class="vc-panel" role="complementary" aria-label="Chamados do contato">' +
    '  <header class="vc-header">' +
    '    <div class="vc-brand">' +
    '      <span class="vc-brand-icon" aria-hidden="true">' + ICONS.ticket + '</span>' +
    '      <div class="vc-brand-text"><h1>Chamados</h1><p>CRM Vuca</p></div>' +
    '    </div>' +
    '    <div class="vc-header-actions">' +
    '      <button class="vc-icon-btn" data-action="theme" type="button" aria-label="Alternar tema" title="Alternar tema">' + ICONS.moon + '</button>' +
    '      <button class="vc-icon-btn" data-action="close" type="button" aria-label="Fechar painel" title="Fechar painel">' + ICONS.close + '</button>' +
    '    </div>' +
    '  </header>' +
    '  <div class="vc-body">' +
    '    <section class="vc-contact" aria-label="Contato atual">' +
    '      <div class="vc-contact-main">' +
    '        <div class="vc-avatar" data-ref="avatar">?</div>' +
    '        <div class="vc-contact-copy">' +
    '          <p class="vc-contact-name" data-ref="contactName">Nenhuma conversa selecionada</p>' +
    '          <p class="vc-contact-hint" data-ref="contactHint">Abra uma conversa ou informe uma instância.</p>' +
    '        </div>' +
    '      </div>' +
    '      <label class="vc-field" for="vc-instance">' +
    '        <span class="vc-field-label">Instância</span>' +
    '        <input id="vc-instance" data-ref="instance" class="vc-input" type="text" autocomplete="off" spellcheck="false" placeholder="Ex.: universopark" />' +
    '      </label>' +
    '      <button class="vc-search-btn" data-action="search" type="button">' +
    '        <span class="vc-search-icon" aria-hidden="true">' + ICONS.refresh + '</span>' +
    '        <span data-ref="searchLabel">Buscar chamados</span>' +
    '      </button>' +
    '      <p class="vc-meta" data-ref="meta" role="status" aria-live="polite"></p>' +
    '    </section>' +
    '    <div class="vc-list" data-ref="list" aria-live="polite"></div>' +
    '  </div>' +
    '  <footer class="vc-footer">' +
    '    <a class="vc-crm-link" data-ref="crmLink" href="https://crm.vucasolution.com.br/" target="_blank" rel="noopener noreferrer">' +
    '      <span>Abrir CRM</span>' + ICONS.external +
    '    </a>' +
    '  </footer>' +
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
    crmLink: app.querySelector('[data-ref="crmLink"]'),
    themeBtn: app.querySelector('[data-action="theme"]'),
    closeBtn: app.querySelector('[data-action="close"]'),
    openBtn: app.querySelector('[data-action="open"]')
  };

  var state = {
    open: true,
    theme: 'light',
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

  function applyTheme(theme, persist) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    app.dataset.theme = state.theme;

    var dark = state.theme === 'dark';
    refs.themeBtn.innerHTML = dark ? ICONS.sun : ICONS.moon;
    var label = dark ? 'Mudar para tema claro' : 'Mudar para tema escuro';
    refs.themeBtn.setAttribute('aria-label', label);
    refs.themeBtn.setAttribute('title', label);

    if (persist) {
      var values = {};
      values[STORAGE_THEME] = state.theme;
      storeSet(values);
    }
  }

  function initTheme() {
    var pageDark = document.documentElement.classList.contains('dark');
    applyTheme(pageDark ? 'dark' : 'light', false);
    storeGet([STORAGE_THEME], function (data) {
      if (data[STORAGE_THEME] === 'dark' || data[STORAGE_THEME] === 'light') {
        applyTheme(data[STORAGE_THEME], false);
      }
    });
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

  function updateCrmLink() {
    var instance = clean(refs.instance.value);
    refs.crmLink.href = instance
      ? CRM_LIST_URL + '?instancia=' + encodeURIComponent(instance)
      : CRM_HOME;
  }

  function updateSearchState() {
    var hasInstance = clean(refs.instance.value) !== '';
    refs.searchBtn.disabled = state.loading || !hasInstance;
    refs.searchBtn.classList.toggle('vc-loading', state.loading);
    refs.searchLabel.textContent = state.loading ? 'Buscando...' : 'Buscar chamados';
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
    updateCrmLink();

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
            "O nome do contato não contém uma instância no formato 'Nome - instância'. Informe a instância abaixo e toque em Buscar chamados."
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
          'Entre no CRM Vuca para consultar os chamados desta unidade. Depois, toque em Buscar chamados.',
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

        if (manual) updateCrmLink();
      });
    } catch (err) {
      state.loading = false;
      state.activeRequestInstance = '';
      updateSearchState();
      showError('Não foi possível falar com a extensão. Recarregue a página e tente novamente.');
    }
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
    updateCrmLink();

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

  refs.themeBtn.addEventListener('click', function () {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark', true);
  });

  refs.closeBtn.addEventListener('click', function () {
    setOpen(false, true);
  });

  refs.openBtn.addEventListener('click', function () {
    setOpen(true, true);
  });

  initTheme();
  setOpen(true, false);
  updateCrmLink();

  storeGet([STORAGE_OPEN], function (data) {
    if (typeof data[STORAGE_OPEN] === 'boolean') setOpen(data[STORAGE_OPEN], false);
    start();
  });
  window.setTimeout(start, 1200);
})();
