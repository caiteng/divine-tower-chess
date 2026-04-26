#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build', 'web-mobile');
const OUT_DIR = path.join(ROOT, 'tmp', 'web-e2e');
const PORT = Number(process.env.E2E_PORT || 8097);
const DEBUG_PORT = Number(process.env.E2E_DEBUG_PORT || 9333);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function serveStatic(rootDir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
    const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let filePath = path.join(rootDir, cleanPath || 'index.html');
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'content-type': getContentType(filePath) });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.wasm')) return 'application/wasm';
  return 'application/octet-stream';
}

function httpJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function waitForDebugTarget() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const targets = await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error('Chrome DevTools target did not start in time.');
}

class Cdp {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.consoleMessages = [];
    this.ws = new WebSocket(wsUrl);
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => this.onMessage(event));
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Log.enable');
  }

  onMessage(event) {
    const msg = JSON.parse(event.data);
    if (msg.id && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map((arg) => arg.value ?? arg.description ?? '').join(' ');
      this.consoleMessages.push(`[console:${msg.params.type}] ${text}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      this.consoleMessages.push(`[exception] ${msg.params.exceptionDetails?.text || 'unknown exception'}`);
    }
    if (msg.method === 'Log.entryAdded') {
      const entry = msg.params.entry;
      const url = entry.url ? ` ${entry.url}` : '';
      this.consoleMessages.push(`[log:${entry.level}] ${entry.text}${url}`);
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed');
    }
    return result.result?.value;
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  async screenshot(name) {
    const result = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), Buffer.from(result.data, 'base64'));
  }

  close() {
    this.ws.close();
  }
}

const STATE_EXPR = `(() => {
  const cc = globalThis.cc;
  const scene = cc?.director?.getScene?.();
  const childrenOf = (node) => node?.children || node?._children || [];
  const compsOf = (node) => node?.components || node?._components || [];
  const names = [];
  let controller = null;
  function walk(node, depth = 0) {
    if (!node || depth > 8) return;
    names.push({ name: node.name, active: node.active, activeInHierarchy: node.activeInHierarchy });
    for (const comp of compsOf(node)) {
      const cname = comp?.constructor?.name || comp?.__classname__ || '';
      if (cname === 'BattleSceneController' || (comp?.session && comp?.storage && 'mode' in comp)) controller = comp;
    }
    for (const child of childrenOf(node)) walk(child, depth + 1);
  }
  walk(scene);
  let snap = null;
  try { snap = controller?.session?.getSnapshot?.() || null; } catch {}
  return {
    hasCc: Boolean(cc),
    hasScene: Boolean(scene),
    mode: controller?.mode || null,
    selectedUnitId: controller?.selectedUnitId || null,
    phase: snap?.phase || null,
    gold: snap?.gold ?? null,
    bench: snap?.bench?.length ?? null,
    deployed: snap?.deployed?.length ?? null,
    benchUnits: snap?.bench?.map((u) => ({ id: u.instanceId, unitId: u.unitId, star: u.star })) || [],
    deployedUnits: snap?.deployed?.map((u) => ({ id: u.instanceId, unitId: u.unitId, star: u.star })) || [],
    allies: snap?.allies?.map((u) => ({ id: u.instanceId, unitId: u.unitId, role: u.role, x: u.position.x, y: u.position.y, command: u.command.type })) || [],
    enemies: snap?.enemies?.map((e) => ({ id: e.instanceId, type: e.enemyType, x: e.position.x, y: e.position.y })) || [],
    nodes: names.slice(0, 80),
    canvas: (() => {
      const rect = document.querySelector('canvas')?.getBoundingClientRect();
      return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
    })(),
  };
})()`;

async function waitFor(cdp, label, predicate, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  let lastState = null;
  while (Date.now() < deadline) {
    lastState = await cdp.eval(STATE_EXPR);
    if (predicate(lastState)) return lastState;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${label}. Last state: ${JSON.stringify(lastState)}`);
}

function uiToScreen(state, x, y) {
  const rect = state.canvas;
  if (!rect) throw new Error('No canvas rect available.');
  return {
    x: rect.left + rect.width / 2 + x * (rect.width / 960),
    y: rect.top + rect.height / 2 - y * (rect.height / 640),
  };
}

function worldToBattleUi(worldX, worldY) {
  return {
    x: (worldX / 1200 - 0.5) * 888,
    y: (0.5 - worldY / 700) * 348 + 20,
  };
}

async function clickUi(cdp, state, x, y) {
  const point = uiToScreen(state, x, y);
  await cdp.click(point.x, point.y);
  await sleep(500);
}

async function clickNode(cdp, nodeName) {
  const clicked = await cdp.eval(`(() => {
    const cc = globalThis.cc;
    const scene = cc?.director?.getScene?.();
    const childrenOf = (node) => node?.children || node?._children || [];
    let target = null;
    function walk(node) {
      if (!node || target) return;
      if (node.name === ${JSON.stringify(nodeName)} && node.activeInHierarchy !== false) {
        target = node;
        return;
      }
      for (const child of childrenOf(node)) walk(child);
    }
    walk(scene);
    if (!target) return false;
    target.emit(cc?.Button?.EventType?.CLICK || 'click');
    return true;
  })()`);
  if (!clicked) throw new Error(`Unable to find active Cocos node: ${nodeName}`);
  await sleep(500);
}

function isSeriousConsoleMessage(line) {
  if (/favicon\.ico/i.test(line)) return false;
  return /\b(error|exception|unhandled|failed|unable to resolve)\b/i.test(line);
}

async function run() {
  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    throw new Error(`Missing build output: ${BUILD_DIR}. Run Cocos web-mobile build first.`);
  }
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await serveStatic(BUILD_DIR);
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=960,640',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${path.join(OUT_DIR, 'chrome-profile')}`,
    `http://127.0.0.1:${PORT}/`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let cdp;
  try {
    const wsUrl = await waitForDebugTarget();
    cdp = new Cdp(wsUrl);
    await cdp.open();
    await waitFor(cdp, 'Cocos scene ready', (s) => s.hasCc && s.hasScene && s.mode === 'menu' && s.canvas, 45000);
    let state = await cdp.eval(STATE_EXPR);
    await cdp.screenshot('01-menu');

    await clickNode(cdp, 'StartButton');
    state = await waitFor(cdp, 'character select', (s) => s.mode === 'select');
    await cdp.screenshot('02-select');

    await clickNode(cdp, 'Next');
    await clickNode(cdp, 'Confirm');
    state = await waitFor(cdp, 'prep phase', (s) => s.mode === 'battle' && s.phase === 'prep' && s.bench >= 1);
    await sleep(3200);
    await cdp.screenshot('03-prep');

    const starter = state.benchUnits[0];
    if (!starter) throw new Error('Starter unit was not found on the bench.');
    await clickNode(cdp, `Deploy-${starter.id}`);
    state = await waitFor(cdp, 'deployed starter', (s) => s.deployed >= 1);

    await clickNode(cdp, 'Start');
    state = await waitFor(cdp, 'battle phase with ally', (s) => s.phase === 'battle' && s.allies.length >= 1);
    await sleep(800);
    await cdp.screenshot('04-battle');

    const ally = state.allies[0];
    await clickNode(cdp, `Ally-${ally.id}`);
    state = await waitFor(cdp, 'ally selected', (s) => Boolean(s.selectedUnitId));

    const moveUi = worldToBattleUi(120, 120);
    await clickUi(cdp, state, moveUi.x, 108 + moveUi.y);
    state = await waitFor(cdp, 'move command accepted', (s) => s.allies.some((u) => u.id === s.selectedUnitId && u.command === 'move'));
    await sleep(800);
    await cdp.screenshot('05-move-command');

    state = await waitFor(cdp, 'enemy spawned', (s) => s.enemies.length >= 1, 10000);
    const enemy = state.enemies[0];
    await clickNode(cdp, `Enemy-${enemy.id}`);
    state = await waitFor(cdp, 'focus command accepted', (s) => s.allies.some((u) => u.id === s.selectedUnitId && u.command === 'focus_enemy'), 8000);
    await sleep(800);
    await cdp.screenshot('06-focus-command');

    const seriousMessages = cdp.consoleMessages.filter(isSeriousConsoleMessage);
    const summary = {
      ok: seriousMessages.length === 0,
      finalState: state,
      seriousMessages,
      screenshotsDir: OUT_DIR,
    };
    fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    if (!summary.ok) process.exitCode = 1;
  } catch (err) {
    if (cdp) {
      try {
        await cdp.screenshot('failure');
      } catch {
        // Ignore screenshot failures; the thrown error below is more useful.
      }
      fs.writeFileSync(path.join(OUT_DIR, 'console-on-failure.log'), cdp.consoleMessages.join('\n'));
    }
    throw err;
  } finally {
    if (cdp) cdp.close();
    chrome.kill('SIGTERM');
    server.close();
  }
}

run().catch((err) => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
