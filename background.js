'use strict';

const CRM_ORIGIN = 'https://crm.vucasolution.com.br';
const CRM_HOME = `${CRM_ORIGIN}/`;
const SENDI_CHAT = 'https://suportevuca.sendi.chat/chat';
const MAX_INSTANCE_LENGTH = 120;
const REQUEST_TIMEOUT_MS = 20000;

function buildListUrl(instancia) {
  return `${CRM_ORIGIN}/pg_chamados.php?instancia=${encodeURIComponent(instancia)}`;
}

function timeoutFetch(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchViaBackground(url) {
  const response = await timeoutFetch(url, {
    credentials: 'include',
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      Accept: 'text/html,application/xhtml+xml'
    }
  });
  return {
    status: response.status,
    finalUrl: response.url || url,
    html: await response.text()
  };
}

async function fetchViaCrmTab(url) {
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({ url: `${CRM_ORIGIN}/*` });
  } catch (err) {
    return null;
  }
  if (!tabs.length) return null;

  const tab = tabs.find((item) => item.active) || tabs[0];
  if (!tab || typeof tab.id !== 'number') return null;

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (targetUrl, timeoutMs) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(targetUrl, {
            credentials: 'include',
            redirect: 'follow',
            cache: 'no-store',
            signal: controller.signal,
            headers: { Accept: 'text/html,application/xhtml+xml' }
          });
          return {
            status: response.status,
            finalUrl: response.url || targetUrl,
            html: await response.text()
          };
        } catch (err) {
          return { error: String((err && err.message) || err) };
        } finally {
          clearTimeout(timer);
        }
      },
      args: [url, REQUEST_TIMEOUT_MS]
    });
    const result = results && results[0] && results[0].result;
    if (!result || result.error) return null;
    return result;
  } catch (err) {
    return null;
  }
}

function classify(result) {
  const html = result.html || '';
  const finalUrl = result.finalUrl || '';
  let pathname = '';

  try {
    pathname = new URL(finalUrl, CRM_ORIGIN).pathname;
  } catch (err) {
    pathname = '';
  }

  const loginForm = /name=["']auth_login["']/i.test(html) && /name=["']auth_senha["']/i.test(html);
  const loginUrl = pathname === '/' || /(?:^|\/)login(?:\.php)?\/?$/i.test(pathname);
  const cloudflare =
    /<title>\s*Just a moment/i.test(html) ||
    /id=["']challenge-form["']/i.test(html) ||
    /window\._cf_chl_opt/.test(html);

  if (loginForm) return { authRequired: true };
  if (cloudflare) return { cloudflare: true };
  if (loginUrl || result.status === 401 || result.status === 403) return { authRequired: true };
  if (result.status >= 500) return { error: `O CRM respondeu com erro ${result.status}.` };
  if (!html.trim()) return { error: 'O CRM retornou uma resposta vazia.' };
  return null;
}

async function fetchTickets(instancia) {
  const url = buildListUrl(instancia);
  let lastError = '';
  let sawAuth = false;
  let sawCloudflare = false;

  const loaders = [fetchViaBackground, fetchViaCrmTab];

  for (const loader of loaders) {
    let result = null;
    try {
      result = await loader(url);
    } catch (err) {
      lastError = String((err && err.message) || err);
      continue;
    }
    if (!result) continue;

    const problem = classify(result);
    if (!problem) {
      return { ok: true, html: result.html, url: result.finalUrl || url };
    }
    if (problem.authRequired) {
      sawAuth = true;
      continue;
    }
    if (problem.cloudflare) {
      sawCloudflare = true;
      continue;
    }
    if (problem.error) lastError = problem.error;
  }

  if (sawCloudflare) {
    return {
      ok: false,
      cloudflare: true,
      error: 'O CRM pediu uma verificação do Cloudflare. Abra o CRM em uma aba, conclua a verificação e tente novamente.'
    };
  }
  if (sawAuth) {
    return {
      ok: false,
      authRequired: true,
      error: 'Faça login no CRM para consultar os chamados.'
    };
  }
  return {
    ok: false,
    error: lastError || 'Não foi possível consultar o CRM. Verifique se você está conectado.'
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return false;

  if (message.type === 'vc:fetchTickets') {
    const instancia = typeof message.instancia === 'string' ? message.instancia.trim() : '';
    if (!instancia) {
      sendResponse({ ok: false, error: 'Instância não informada.' });
      return false;
    }
    if (instancia.length > MAX_INSTANCE_LENGTH) {
      sendResponse({ ok: false, error: 'Instância inválida.' });
      return false;
    }

    fetchTickets(instancia)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({
          ok: false,
          error: `Falha inesperada ao consultar o CRM: ${(err && err.message) || err}`
        });
      });
    return true;
  }

  if (message.type === 'vc:openCrm') {
    chrome.tabs.create({ url: CRM_HOME });
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

chrome.action.onClicked.addListener(async () => {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://suportevuca.sendi.chat/*' });
    if (tabs.length) {
      const tab = tabs.find((item) => item.active) || tabs[0];
      if (tab && typeof tab.id === 'number') {
        await chrome.tabs.update(tab.id, { active: true });
        if (typeof tab.windowId === 'number') {
          await chrome.windows.update(tab.windowId, { focused: true });
        }
        return;
      }
    }
    await chrome.tabs.create({ url: SENDI_CHAT });
  } catch (err) {
    chrome.tabs.create({ url: SENDI_CHAT });
  }
});
