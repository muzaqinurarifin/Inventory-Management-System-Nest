import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML = path.resolve('docs/laporan-penilaian.html');
const PDF = path.resolve('docs/Laporan-Penilaian-Inventory-Management-System.pdf');
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = await mkdtemp(path.join(tmpdir(), 'chrome-pdf-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitFor(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      /* not ready */
    }
    await sleep(200);
  }
  throw new Error(`Timeout menunggu ${url}`);
}

let ws;
try {
  await waitFor(`http://127.0.0.1:${PORT}/json/version`);

  const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: 'PUT',
  });
  const target = await targetRes.json();

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      const fn = listeners.get(msg.method);
      listeners.delete(msg.method);
      fn(msg.params);
    }
  };

  const send = (method, params = {}) => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const once = (method) =>
    new Promise((resolve) => {
      listeners.set(method, resolve);
    });

  await send('Page.enable');
  await send('Runtime.enable');

  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: pathToFileURL(HTML).href });
  await Promise.race([loaded, sleep(10000)]);
  await send('Runtime.evaluate', {
    expression:
      'document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true',
    awaitPromise: true,
    returnByValue: true,
  });

  await send('Emulation.setDeviceMetricsOverride', {
    width: 794,
    height: 1123,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Emulation.setEmulatedMedia', { media: 'print' });

  const layout = await send('Runtime.evaluate', {
    expression: `(() => {
      const width = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.right > width + 2 || r.left < -2))
        .slice(0, 12)
        .map(({ el, r }) => {
          const cls = typeof el.className === 'string' ? el.className : (el.className.baseVal || '');
          return el.tagName.toLowerCase() + (cls ? '.' + cls.split(' ').join('.') : '') + ' right=' + Math.round(r.right);
        });
      return JSON.stringify({
        width,
        scrollWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        overflow: bad,
      });
    })()`,
    returnByValue: true,
  });
  console.log('LAYOUT', layout.result.value);

  const headerTemplate = `<table style="width:100%;font-family:'Segoe UI',Arial,sans-serif;font-size:7px;color:#8a9aa8;border-collapse:collapse;padding:0 0.55in;"><tr><td style="text-align:left;padding-left:0.55in;">INVENTORY MANAGEMENT API</td><td style="text-align:right;padding-right:0.55in;">FRAMEWORK PROGRAMMING &middot; SEMESTER 5</td></tr></table>`;
  const footerTemplate = `<table style="width:100%;font-family:'Segoe UI',Arial,sans-serif;font-size:7px;color:#8a9aa8;border-collapse:collapse;padding:0 0.55in;"><tr><td style="text-align:left;padding-left:0.55in;">Laporan Pemenuhan Kriteria Penilaian</td><td style="text-align:right;padding-right:0.55in;">Halaman <span class="pageNumber"></span> / <span class="totalPages"></span></td></tr></table>`;

  const { data } = await send('Page.printToPDF', {
    paperWidth: 8.27,
    paperHeight: 11.69,
    marginTop: 0.62,
    marginBottom: 0.62,
    marginLeft: 0.55,
    marginRight: 0.55,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    preferCSSPageSize: false,
    scale: 1,
  });

  await writeFile(PDF, Buffer.from(data, 'base64'));
  const pdf = await readFile(PDF);
  const text = pdf.toString('latin1');
  const pages = (text.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`PDF: ${PDF}`);
  console.log(`SIZE: ${(pdf.length / 1024).toFixed(1)} KB`);
  console.log(`PAGES: ${pages}`);
} finally {
  try {
    ws?.close();
  } catch {
    /* ignore */
  }
  chrome.kill();
  await sleep(600);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
