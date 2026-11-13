(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.VucaChamadosParser = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CRM_ORIGIN = 'https://crm.vucasolution.com.br';

  var COLUMN_ALIASES = {
    numero: ['n', 'no', 'num', 'numero', 'n chamado', 'numero chamado', 'chamado', 'id', 'codigo', 'protocolo'],
    data: ['data', 'data criacao', 'data de criacao', 'criacao', 'data abertura', 'abertura', 'criado em', 'data cadastro'],
    status: ['status', 'situacao', 'situacao atual', 'status atual'],
    funcionalidade: ['funcionalidade', 'funcionalidade afetada', 'modulo', 'assunto', 'titulo'],
    tipo: ['tipo', 'tipo chamado', 'tipo de chamado', 'categoria'],
    instancia: ['instancia', 'unidade', 'loja'],
    prioridade: ['prioridade', 'urgencia']
  };

  var FALLBACK_INDEX = {
    numero: 0,
    data: 1,
    instancia: 2,
    tipo: 3,
    funcionalidade: 6,
    prioridade: 8,
    status: 9
  };

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function normalize(value) {
    return clean(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function extractInstance(name) {
    var value = clean(name);
    if (!value) return '';
    var parts = value.split(/\s*[-\u2013\u2014]\s*/).filter(Boolean);
    if (parts.length < 2) return '';
    return clean(parts[1]);
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    if (typeof el.getClientRects === 'function' && el.getClientRects().length === 0) return false;
    return true;
  }

  function expandedCells(row) {
    var out = [];
    var children = row ? row.children : [];
    for (var i = 0; i < children.length; i++) {
      var cell = children[i];
      var tag = (cell.tagName || '').toLowerCase();
      if (tag !== 'td' && tag !== 'th') continue;
      var span = parseInt(cell.getAttribute('colspan') || '1', 10);
      if (!span || span < 1) span = 1;
      for (var j = 0; j < span; j++) out.push(cell);
    }
    return out;
  }

  function headerRow(table) {
    if (!table) return null;
    var rows = table.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].querySelector('th')) return rows[i];
    }
    return rows[0] || null;
  }

  function headerLabels(table) {
    var row = headerRow(table);
    var cells = expandedCells(row);
    var labels = [];
    for (var i = 0; i < cells.length; i++) labels.push(clean(cells[i].textContent));
    return labels;
  }

  function cellText(cell) {
    if (!cell) return '';
    var clone = cell.cloneNode(true);
    var unwanted = clone.querySelectorAll('script, style, [hidden]');
    for (var i = 0; i < unwanted.length; i++) unwanted[i].parentNode.removeChild(unwanted[i]);

    var options = clone.querySelectorAll('option');
    for (var j = 0; j < options.length; j++) {
      if (!options[j].hasAttribute('selected')) options[j].parentNode.removeChild(options[j]);
    }

    var text = clean(clone.textContent);
    if (text) return text;

    var labelled = clone.querySelector('[title], [aria-label]');
    if (labelled) {
      return clean(labelled.getAttribute('title') || labelled.getAttribute('aria-label'));
    }
    return '';
  }

  function findColumn(headers, aliases) {
    for (var i = 0; i < aliases.length; i++) {
      var wanted = normalize(aliases[i]);
      for (var j = 0; j < headers.length; j++) {
        if (normalize(headers[j]) === wanted) return j;
      }
    }
    for (var k = 0; k < aliases.length; k++) {
      var partial = normalize(aliases[k]);
      if (!partial) continue;
      for (var l = 0; l < headers.length; l++) {
        if (normalize(headers[l]).indexOf(partial) !== -1) return l;
      }
    }
    return -1;
  }

  function scoreHeaders(headers) {
    var score = 0;
    var keys = Object.keys(COLUMN_ALIASES);
    for (var i = 0; i < keys.length; i++) {
      if (findColumn(headers, COLUMN_ALIASES[keys[i]]) !== -1) score += 10;
    }
    return score;
  }

  function tableTicketLinks(table) {
    if (!table) return 0;
    return table.querySelectorAll('a[href*="edita=" i]').length;
  }

  function rowHasTicket(row) {
    if (!row) return false;
    if (row.querySelector('a[href*="edita=" i]')) return true;
    return /[?&](?:amp;)?edita=/i.test(row.innerHTML || '');
  }

  function findTicketNumber(row, cells, headers) {
    var numero = '';
    var link = row.querySelector('a[href*="edita=" i]');
    if (link) {
      var href = link.getAttribute('href') || '';
      var match = href.match(/[?&]edita=([^&#]+)/i);
      if (match) {
        try {
          numero = decodeURIComponent(match[1]);
        } catch (err) {
          numero = match[1];
        }
      }
    }

    if (!numero) {
      var htmlMatch = (row.innerHTML || '').match(/[?&](?:amp;)?edita=([^&"'<>\s]+)/i);
      if (htmlMatch) {
        try {
          numero = decodeURIComponent(htmlMatch[1]);
        } catch (err) {
          numero = htmlMatch[1];
        }
      }
    }

    var numberIndex = findColumn(headers, COLUMN_ALIASES.numero);
    if (!numero && numberIndex !== -1 && cells[numberIndex]) {
      var fromCell = cellText(cells[numberIndex]).match(/\d+/);
      if (fromCell) numero = fromCell[0];
    }

    return clean(numero).replace(/^#/, '').trim();
  }

  function valueAt(cells, headers, key, useFallback) {
    var index = findColumn(headers, COLUMN_ALIASES[key]);
    if (index !== -1 && cells[index]) {
      var direct = cellText(cells[index]);
      if (direct) return direct;
    }
    if (useFallback) {
      var fallbackIndex = FALLBACK_INDEX[key];
      if (typeof fallbackIndex === 'number' && cells[fallbackIndex]) {
        return cellText(cells[fallbackIndex]);
      }
    }
    return '';
  }

  function extractRow(row, headers) {
    if (!rowHasTicket(row)) return null;
    var cells = expandedCells(row);
    var numero = findTicketNumber(row, cells, headers);
    if (!numero) return null;

    var useFallback = headers.length === 0 || headers.length >= 7;
    return {
      numero: numero,
      url: CRM_ORIGIN + '/pg_chamados.php?form=1&edita=' + encodeURIComponent(numero),
      status: valueAt(cells, headers, 'status', useFallback),
      data: valueAt(cells, headers, 'data', useFallback),
      funcionalidade: valueAt(cells, headers, 'funcionalidade', useFallback),
      tipo: valueAt(cells, headers, 'tipo', useFallback),
      instancia: valueAt(cells, headers, 'instancia', false),
      prioridade: valueAt(cells, headers, 'prioridade', false)
    };
  }

  function dataRows(table) {
    if (!table) return [];
    var rows = Array.prototype.slice.call(table.querySelectorAll('tr'));
    var header = headerRow(table);
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row === header) continue;
      if (row.querySelector('th') && !row.querySelector('td')) continue;
      out.push(row);
    }
    return out;
  }

  function parseTickets(html, options) {
    var ParserCtor = (options && options.DOMParser) || (typeof DOMParser !== 'undefined' ? DOMParser : null);
    if (!ParserCtor) throw new Error('DOMParser unavailable');

    var doc = new ParserCtor().parseFromString(html || '', 'text/html');
    var tables = Array.prototype.slice.call(doc.querySelectorAll('table'));
    var best = null;
    var bestScore = -1;

    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      var headers = headerLabels(table);
      var score = scoreHeaders(headers) + tableTicketLinks(table) * 4;
      if (score > bestScore) {
        bestScore = score;
        best = { table: table, headers: headers };
      }
    }

    var tickets = [];
    if (best && bestScore > 0) {
      var rows = dataRows(best.table);
      for (var r = 0; r < rows.length; r++) {
        var ticket = extractRow(rows[r], best.headers);
        if (ticket) tickets.push(ticket);
      }
    }

    if (!tickets.length) {
      var fallbackRows = Array.prototype.slice.call(doc.querySelectorAll('tr'));
      for (var f = 0; f < fallbackRows.length; f++) {
        if (!rowHasTicket(fallbackRows[f])) continue;
        var fallbackTicket = extractRow(fallbackRows[f], []);
        if (fallbackTicket) tickets.push(fallbackTicket);
      }
    }

    var seen = {};
    var unique = [];
    for (var u = 0; u < tickets.length; u++) {
      if (seen[tickets[u].numero]) continue;
      seen[tickets[u].numero] = true;
      unique.push(tickets[u]);
    }
    return unique;
  }

  function inspectPage(html, finalUrl) {
    var text = html || '';
    var loginForm = /name=["']auth_login["']/i.test(text) && /name=["']auth_senha["']/i.test(text);
    var cloudflare =
      /<title>\s*Just a moment/i.test(text) ||
      /id=["']challenge-form["']/i.test(text) ||
      /window\._cf_chl_opt/.test(text);
    var pathname = '';

    try {
      pathname = new URL(finalUrl || '', CRM_ORIGIN).pathname;
    } catch (err) {
      pathname = '';
    }

    var loginUrl = pathname === '/' || /(?:^|\/)login(?:\.php)?\/?$/i.test(pathname);
    return {
      authRequired: Boolean(loginForm || (loginUrl && !cloudflare)),
      cloudflare: Boolean(cloudflare && !loginForm)
    };
  }

  return {
    CRM_ORIGIN: CRM_ORIGIN,
    clean: clean,
    normalize: normalize,
    extractInstance: extractInstance,
    isVisible: isVisible,
    parseTickets: parseTickets,
    inspectPage: inspectPage
  };
});
