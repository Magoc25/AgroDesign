#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   AgroDesign — verificação antes de subir  (§35 do "Guia de projetos.md")

   Dois degraus, num arquivo só:

     1) ESTÁTICO — roda SEM nenhuma dependência (`node check.js`): sintaxe de
        todo <script> embutido (vm.Script), id/handler órfão, arquivo local
        referenciado que sumiu, coerência de versão entre os 5 lugares onde ela
        aparece, e a cobertura do modo escuro (regra travada por teste, r67c/r68b).

     2) JSDOM — se o jsdom estiver instalado, faz o BOOT REAL dos dois módulos e
        dirige os fluxos (gerar croqui, trocar aba, reposicionar, gerar placa),
        assertando o DOM e o estado interno via window.eval.

   No CI (`process.env.CI`) a ausência do jsdom é ERRO: teste que "passa" por não
   ter rodado é pior que teste vermelho (§35 / r57d). O workflow instala o jsdom
   com `npm install --no-save --no-package-lock jsdom` — o repositório continua
   SEM marcadores npm (package.json/node_modules), como manda o ciclo do r33.

   Uso:  node check.js            → estático (+ jsdom, se houver)
         CI=1 node check.js       → exige jsdom
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT   = __dirname;
const read   = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));

const MODULES = [
  { file: 'AgroDesign.html',    nome: 'Campo', versionConst: 'APP_VERSION', rotulo: '© MGC · v'      },
  { file: 'AgroDesignLab.html', nome: 'Lab',   versionConst: 'LAB_VERSION', rotulo: '© MGC · Lab v' },
];

let pass = 0;
const fails = [];
const ok = (cond, msg) => { if (cond) pass++; else { fails.push(msg); console.log('   ✗ ' + msg); } };
const secao = t => console.log('\n' + t);

/* ═════════════════════════ DEGRAU 1 — ESTÁTICO ═════════════════════════ */

/* Blocos <script> embutidos (ignora os de CDN, que têm src=) */
function scriptBlocks(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) if (!/\bsrc\s*=/i.test(m[1])) out.push(m[2]);
  return out;
}

/* Primeiro bloco <style> = o CSS do app (os demais são strings de impressão) */
function cssDoApp(html) {
  const m = /<style[^>]*>([\s\S]*?)<\/style>/i.exec(html);
  return m ? m[1] : '';
}

function regrasCss(css) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ sel: m[1].trim(), corpo: m[2], at: m.index });
  return out;
}

/* Intervalo [inicio, fim] do bloco que começa em `de` (casa as chaves) */
function blocoEm(css, de) {
  const abre = css.indexOf('{', de);
  if (abre < 0) return null;
  let n = 0;
  for (let i = abre; i < css.length; i++) {
    if (css[i] === '{') n++;
    else if (css[i] === '}' && --n === 0) return [de, i];
  }
  return [de, css.length];
}

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const GLOBAIS_OK = new Set([
  'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'Number', 'String', 'Boolean',
  'Array', 'Object', 'JSON', 'Math', 'Date', 'RegExp', 'Set', 'Map', 'Promise', 'Error',
  'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout', 'setInterval',
  'requestAnimationFrame', 'if', 'for', 'while', 'switch', 'return', 'typeof', 'new',
  'catch', 'function', 'else', 'do', 'try', 'void', 'delete',
]);

/* Fundos claros fixos: quem usa isto TEM de ter contraparte [data-dark] */
const FUNDO_CLARO = /background\s*:\s*#(?:fff|ffffff|fafafa|f9fbfa|f8f9fa|f5f5f5|fefefe|fdfdfd|eee|eeeeee)\b/i;

function estatico() {
  secao('▸ Estático — sintaxe, fiação, arquivos, versão, modo escuro');

  const versoes = new Set();

  for (const mod of MODULES) {
    const html = read(mod.file);
    const blocos = scriptBlocks(html);

    /* 1. Sintaxe de todo <script> embutido */
    ok(blocos.length >= 1, `${mod.nome}: nenhum <script> embutido encontrado`);
    blocos.forEach((code, i) => {
      try { new vm.Script(code, { filename: `${mod.file}#script${i}` }); ok(true, ''); }
      catch (e) { ok(false, `${mod.nome}: erro de sintaxe no <script> #${i} — ${e.message}`); }
    });

    /* 2. getElementById('x') sem id="x" no documento */
    const idsDecl = new Set([...html.matchAll(/\bid\s*=\s*["']([^"'${}]+)["']/g)].map(m => m[1]));
    const idsUso  = new Set([...html.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]));
    const orfaos  = [...idsUso].filter(id => !idsDecl.has(id));
    ok(orfaos.length === 0, `${mod.nome}: getElementById sem id correspondente → ${orfaos.join(', ')}`);

    /* 3. Handler inline (onclick=...) apontando para função inexistente */
    const declaradas = new Set([
      ...[...html.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]),
      ...[...html.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()/g)].map(m => m[1]),
    ]);
    const semDono = new Set();
    for (const m of html.matchAll(/\bon[a-z]+\s*=\s*"([^"]*)"/g)) {
      const attr = m[1];
      if (attr.includes('${')) continue;                       // gerado em runtime
      for (const c of attr.matchAll(/(^|[^\w.$'"])([A-Za-z_$][\w$]*)\s*\(/g)) {
        const nome = c[2];
        if (GLOBAIS_OK.has(nome) || declaradas.has(nome)) continue;
        semDono.add(nome);
      }
    }
    ok(semDono.size === 0, `${mod.nome}: handler inline chama função inexistente → ${[...semDono].join(', ')}`);

    /* 4. Arquivo local referenciado (src/href) que não existe no disco */
    const refs = [...html.matchAll(/\b(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1])
      .filter(u => !/^(?:https?:|data:|blob:|mailto:|javascript:|#|\/\/)/.test(u) && !u.includes('${'));
    const sumidos = [...new Set(refs)].filter(u => !exists(u.replace(/^\.\//, '').split('#')[0]));
    ok(sumidos.length === 0, `${mod.nome}: referência local inexistente → ${sumidos.join(', ')}`);

    /* 5. Versão: constante do código × rótulo estático do rodapé */
    const vConst = (new RegExp(`${mod.versionConst}\\s*=\\s*'([\\d.]+)'`).exec(html) || [])[1];
    ok(!!vConst, `${mod.nome}: ${mod.versionConst} não encontrado`);
    if (vConst) versoes.add(vConst);
    const vRodape = (/<span id="appVersion">[^<]*?v([\d.]+)<\/span>/.exec(html) || [])[1];
    ok(vRodape === vConst, `${mod.nome}: rodapé estático (v${vRodape}) ≠ ${mod.versionConst} (v${vConst})`);

    /* 5b. A versão EXIBIDA vem da constante embutida, nunca de fetch cacheado.
           Regra derivada do código: ninguém pode voltar a montar o rótulo do
           rodapé a partir de um arquivo baixado em runtime (mostraria a versão
           antiga por horas depois de atualizar). */
    ok(!/fetch\((?:['"`])\.\/CHANGELOG\.md/.test(html),
       `${mod.nome}: rodapé voltou a ler a versão do CHANGELOG.md em runtime (use a constante ${mod.versionConst})`);

    /* 5c. Toda chave de localStorage é prefixada pelo projeto — o storage é por
           ORIGEM (magoc25.github.io), então chave sem prefixo colide com os
           outros apps publicados no mesmo endereço. */
    const literais = [...html.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    const porConst = [...html.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*([A-Za-z_$][\w$]*)\s*[,)]/g)]
      .map(m => (new RegExp(`\\b${m[1]}\\s*=\\s*['"]([^'"]+)['"]`).exec(html) || [])[1])
      .filter(Boolean);
    const semPrefixo = [...new Set([...literais, ...porConst])].filter(k => !k.startsWith('agrodesign'));
    ok(semPrefixo.length === 0, `${mod.nome}: chave de localStorage sem prefixo do projeto → ${semPrefixo.join(', ')}`);

    /* 6. Cobertura do modo escuro — a REGRA virou teste (r67c/r68b):
          toda regra CSS com fundo claro FIXO precisa de contraparte [data-dark].
          Assim, a próxima superfície que nascer fora do sistema derruba isto sozinha. */
    const css = cssDoApp(html).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
    const semPrint = [];
    for (const m of css.matchAll(/@media\s+print/g)) {
      const r = blocoEm(css, m.index);
      if (r) semPrint.push(r);
    }
    const emPrint = at => semPrint.some(([a, b]) => at >= a && at <= b);
    const descobertos = [];
    for (const regra of regrasCss(css)) {
      if (!FUNDO_CLARO.test(regra.corpo)) continue;
      if (regra.sel.startsWith('@') || /^(?:from|to|\d+%)$/.test(regra.sel)) continue;
      if (regra.sel.includes('[data-dark]') || emPrint(regra.at)) continue;
      const coberto = regra.sel.split(',').some(p => {
        const s = p.trim();
        return s && new RegExp(`\\[data-dark\\]\\s*${escRe(s)}(?![\\w-])`).test(css);
      });
      if (!coberto) descobertos.push(regra.sel);
    }
    ok(descobertos.length === 0,
      `${mod.nome}: fundo claro fixo sem regra [data-dark] (some no modo escuro) → ${descobertos.join(' | ')}`);
  }

  /* 7. Mesma versão nos dois módulos, no README e no CHANGELOG */
  ok(versoes.size === 1, `Campo e Lab em versões diferentes → ${[...versoes].join(' / ')}`);
  const v = [...versoes][0];
  const readme = read('README.md');
  const vBadge = (/badge\/vers%C3%A3o-([\d.]+)-|badge\/versão-([\d.]+)-/.exec(readme) || []).slice(1).find(Boolean);
  ok(vBadge === v, `README: badge de versão (v${vBadge}) ≠ código (v${v})`);
  const vChangelog = (/^##\s*\[([\d.]+)\]/m.exec(read('CHANGELOG.md')) || [])[1];
  ok(vChangelog === v, `CHANGELOG: última versão ([${vChangelog}]) ≠ código (v${v})`);

  /* 8. Service Worker + manifest apontando para arquivos que existem */
  const sw = read('sw.js');
  ok(/CACHE_NAME\s*=\s*'[^']+'/.test(sw), 'sw.js: CACHE_NAME não encontrado');
  const alvosSw = [...sw.matchAll(/includes\('([^']+)'\)/g)].map(m => m[1]).filter(a => !a.startsWith('icon-'));
  const swSumidos = alvosSw.filter(a => !exists(a));
  ok(swSumidos.length === 0, `sw.js: arquivo cacheado inexistente → ${swSumidos.join(', ')}`);

  const manifest = JSON.parse(read('manifest.json'));
  ok(exists(manifest.start_url.replace(/^\.\//, '')), `manifest: start_url inexistente → ${manifest.start_url}`);
  const iconesSumidos = manifest.icons.map(i => i.src).filter(s => !exists(s));
  ok(iconesSumidos.length === 0, `manifest: ícone inexistente → ${iconesSumidos.join(', ')}`);
}

/* ═════════════════════════ DEGRAU 2 — JSDOM ═════════════════════════ */

function carregaJsdom() {
  try { return require('jsdom'); }
  catch (e) { return null; }
}

/* Aguarda o evento `load` (r57a): no jsdom ele dispara DEPOIS do construtor —
   assertar antes lê o estado pré-boot e falha "do nada". */
function esperaBoot(w) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('boot travado (sem evento load em 15s)')), 15000);
    if (w.document.readyState === 'complete') { clearTimeout(t); res(); }
    else w.addEventListener('load', () => { clearTimeout(t); res(); });
  });
}

async function boot(jsdom, arquivo, opts = {}) {
  const { JSDOM, VirtualConsole } = jsdom;
  const erros = [];

  /* Neutraliza os <script src> de CDN — o app já é resiliente à ausência deles,
     mas os stubs abaixo entram no lugar para exercitar os caminhos reais. */
  const html = read(arquivo).replace(/<script\b[^>]*\bsrc="https?:[^"]*"[^>]*><\/script>/g, '<!-- cdn stub -->');

  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/Not implemented/i.test(e.message)) erros.push(e.message); });

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://localhost/',
    virtualConsole: vc,
    beforeParse(w) {
      w.onerror = (msg) => { erros.push(String(msg)); };
      w.addEventListener('unhandledrejection', e => erros.push('unhandledrejection: ' + e.reason));

      const ctx2d = {
        measureText: () => ({ width: 0 }), fillRect() {}, clearRect() {}, drawImage() {}, save() {},
        restore() {}, translate() {}, scale() {}, rotate() {}, beginPath() {}, closePath() {}, fill() {},
        stroke() {}, arc() {}, moveTo() {}, lineTo() {}, rect() {}, setTransform() {}, fillText() {},
        strokeText() {}, createLinearGradient: () => ({ addColorStop() {} }), putImageData() {},
        getImageData: () => ({ data: [] }),
      };
      w.HTMLCanvasElement.prototype.getContext = () => ctx2d;
      w.HTMLCanvasElement.prototype.toDataURL  = () => 'data:image/png;base64,';
      w.HTMLCanvasElement.prototype.toBlob     = cb => cb(new w.Blob([]));

      w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, onchange: null,
        addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
      w.scrollTo = () => {};
      w.Element.prototype.scrollIntoView = () => {};
      w.structuredClone = w.structuredClone || structuredClone;   // gap do vm do jsdom (r29)
      w.alert = () => {}; w.confirm = () => true; w.prompt = () => null; w.print = () => {};
      w.URL.createObjectURL = () => 'blob:stub'; w.URL.revokeObjectURL = () => {};
      w.fetch = async () => ({ ok: false, status: 0, json: async () => ({}), text: async () => '' });

      /* Captura o conteúdo dos downloads (scripts, CSV) sem baixar arquivo */
      const RealBlob = w.Blob;
      w.Blob = function (parts, opts) { w.__lastBlob = (parts || []).join(''); return new RealBlob(parts, opts); };

      /* Supabase (reviews/app_config/pings) e XLSX vêm de CDN — stub no lugar.
         `cfgVersion` simula a versão publicada no app_config (banner de update). */
      w.__cfgVersion = opts.cfgVersion || null;
      w.supabase = { createClient: () => ({ from: tabela => ({
        select() { return this; }, eq() { return this; }, order() { return this; },
        limit: async () => ({ data: [], error: null }),
        insert: async () => ({ error: null }), upsert: async () => ({ error: null }),
        single: async () => (tabela === 'app_config' && w.__cfgVersion)
          ? ({ data: { value: w.__cfgVersion }, error: null })
          : ({ data: null, error: true }),
      }) }) };
      w.XLSX = { utils: { book_new: () => ({ SheetNames: [], Sheets: {} }), aoa_to_sheet: () => ({}),
        json_to_sheet: () => ({}), book_append_sheet() {} }, writeFile() {}, write: () => new Uint8Array() };
    },
  });

  await esperaBoot(dom.window);
  return { w: dom.window, erros, fechar: () => dom.window.close() };
}

/* Conta ocorrências por chave */
const contar = arr => arr.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {});

async function smokeCampo(jsdom) {
  secao('▸ jsdom — Campo (AgroDesign.html)');
  const { w, erros, fechar } = await boot(jsdom, 'AgroDesign.html');
  const ev = expr => w.eval(expr);

  ok(erros.length === 0, `Campo: erro de runtime no boot → ${erros.join(' | ')}`);
  ok(ev('typeof generateCroqui') === 'function', 'Campo: generateCroqui não existe após o boot');
  ok(ev('APP_VERSION').length > 0, 'Campo: APP_VERSION vazio');
  ok(ev("document.getElementById('appVersion').textContent").includes('v' + ev('APP_VERSION')),
     `Campo: rodapé mostra "${ev("document.getElementById('appVersion').textContent")}" em vez da versão do código (v${ev('APP_VERSION')})`);

  /* DIC — 4 tratamentos × 3 repetições */
  ev(`document.getElementById('selDesign').value='DIC'; onDesignChange();
      document.getElementById('txtTreatments').value=['T1','T2','T3','T4'].join('\\n');
      document.getElementById('numReps').value='3';
      document.getElementById('numSeed').value='42';
      generateCroqui();`);
  ok(ev('units.length') === 12, `Campo/DIC: esperava 12 UEs, veio ${ev('units.length')}`);
  const dic = JSON.parse(ev('JSON.stringify(units.map(u=>u.treatment))'));
  ok(Object.values(contar(dic)).every(n => n === 3), 'Campo/DIC: alguma repetição fora de 3× por tratamento');
  ok(ev("document.getElementById('errMsg').classList.contains('hidden')"), 'Campo/DIC: #errMsg apareceu numa config válida');

  /* Croqui e Field Book realmente renderizados */
  ok(ev("document.querySelectorAll('#croquiSvg rect').length") > 0, 'Campo: SVG do croqui sem células');
  ok(ev("document.querySelectorAll('#fbBody tr').length") === 12, 'Campo: Field Book com nº de linhas ≠ nº de UEs');
  ok(!!ev("localStorage.getItem('agrodesign_last_config')"), 'Campo: agrodesign_last_config não foi salvo');

  /* Semente: mesma → mesmo croqui; outra → croqui diferente */
  const arranjo = () => ev("units.map(u=>u.treatment).join('|')");
  const a1 = arranjo();
  ev('generateCroqui();');
  ok(arranjo() === a1, 'Campo: mesma semente gerou arranjo diferente (randomização não reprodutível)');
  ev("document.getElementById('numSeed').value='7'; generateCroqui();");
  ok(arranjo() !== a1, 'Campo: semente diferente gerou o mesmo arranjo');

  /* DBC — cada bloco tem cada tratamento exatamente 1× (bloco completo) */
  ev(`document.getElementById('selDesign').value='DBC'; onDesignChange();
      document.getElementById('txtTreatments').value=['A','B','C','D','E'].join('\\n');
      document.getElementById('numReps').value='4';
      document.getElementById('numSeed').value='2026';
      generateCroqui();`);
  const dbc = JSON.parse(ev('JSON.stringify(units.map(u=>({b:u.block,t:u.treatment})))'));
  ok(dbc.length === 20, `Campo/DBC: esperava 20 UEs, veio ${dbc.length}`);
  const blocosOk = [1, 2, 3, 4].every(b => {
    const ts = dbc.filter(u => u.b === b).map(u => u.t);
    return ts.length === 5 && new Set(ts).size === 5;
  });
  ok(blocosOk, 'Campo/DBC: algum bloco não é completo (tratamento repetido ou faltando)');

  /* DQL — quadrado latino de verdade: 1× por linha e 1× por coluna */
  ev(`document.getElementById('selDesign').value='DQL'; onDesignChange();
      document.getElementById('dqlTreatments').value=['A','B','C','D'].join('\\n');
      document.getElementById('dqlSeed').value='42';
      generateCroqui();`);
  const dql = JSON.parse(ev('JSON.stringify(units.map(u=>({r:u.row,c:u.col,t:u.treatment})))'));
  ok(dql.length === 16, `Campo/DQL: esperava 16 UEs (4×4), veio ${dql.length}`);
  const latino = [0, 1, 2, 3].every(i =>
    new Set(dql.filter(u => u.r === i).map(u => u.t)).size === 4 &&
    new Set(dql.filter(u => u.c === i).map(u => u.t)).size === 4);
  ok(latino, 'Campo/DQL: não é quadrado latino (tratamento repetido em linha ou coluna)');

  /* Validação bloqueia config impossível (DQL com nº de níveis inconsistente) */
  ev(`document.getElementById('selDesign').value='DIC'; onDesignChange();
      document.getElementById('txtTreatments').value='';
      generateCroqui();`);
  ok(!ev("document.getElementById('errMsg').classList.contains('hidden')"),
     'Campo: config inválida (sem tratamentos) não mostrou #errMsg');

  /* Abas */
  ev("document.getElementById('selDesign').value='DIC'; onDesignChange();" +
     "document.getElementById('txtTreatments').value=['T1','T2','T3'].join('\\n');" +
     "document.getElementById('numReps').value='3'; generateCroqui(); showTab('fieldbook');");
  ok(ev("document.getElementById('tabFieldbook').classList.contains('active')"), 'Campo: showTab não ativou a aba Field Book');
  ev("showTab('coleta');");
  ok(ev("document.getElementById('tabColeta').classList.contains('active')"), 'Campo: showTab não ativou a aba Coleta');

  /* Reposicionar (v2.1.0): troca dois tratamentos, marca layout personalizado e persiste */
  ev("showTab('croqui'); document.getElementById('chkReposition').checked=true; toggleReposition();");
  const antes = JSON.parse(ev('JSON.stringify([units[0].treatment, units[1].treatment])'));
  ev('handleSwapTap(units[0].id); handleSwapTap(units[1].id);');
  const depois = JSON.parse(ev('JSON.stringify([units[0].treatment, units[1].treatment])'));
  ok(depois[0] === antes[1] && depois[1] === antes[0], 'Campo/Reposicionar: os tratamentos não trocaram de posição');
  ok(ev('_customLayout') === true, 'Campo/Reposicionar: _customLayout não ficou verdadeiro');
  ok(!!ev("localStorage.getItem('agrodesign_autosave')"), 'Campo/Reposicionar: arranjo manual não foi persistido no autosave');

  /* ── Coleta: ordenação e subamostras ──────────────────────────────────
     DBC 3 tratamentos × 3 blocos, com uma variável numérica. */
  ev(`document.getElementById('selDesign').value='DBC'; onDesignChange();
      document.getElementById('txtTreatments').value=['T1','T2','T3'].join('\\n');
      document.getElementById('numReps').value='3';
      document.getElementById('numSeed').value='42';
      generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      collectionData={};
      document.getElementById('numSamples').value='1'; onSamplesChange();
      document.getElementById('selColetaSort').value='trat'; onColetaSortChange();`);

  const trats = () => JSON.parse(ev("JSON.stringify(_coletaRows().map(r=>r.u.treatment))"));
  const blocos = () => JSON.parse(ev("JSON.stringify(_coletaRows().map(r=>r.u.block))"));
  ok(JSON.stringify(trats()) === JSON.stringify(['T1','T1','T1','T2','T2','T2','T3','T3','T3']),
     `Campo/Coleta: ordem por tratamento saiu ${trats().join(',')}`);
  ok(JSON.stringify(blocos()) === JSON.stringify([1,2,3,1,2,3,1,2,3]),
     `Campo/Coleta: dentro do tratamento os blocos não saíram em ordem → ${blocos().join(',')}`);

  ev("document.getElementById('selColetaSort').value='campo'; onColetaSortChange();");
  const ids = JSON.parse(ev("JSON.stringify(_coletaRows().map(r=>r.u.id))"));
  ok(JSON.stringify(ids) === JSON.stringify([...ids].sort((a, b) => a - b)),
     'Campo/Coleta: ordem "Campo (ID)" não saiu por ID crescente');

  ev("document.getElementById('selColetaSort').value='bloco'; onColetaSortChange();");
  const b2 = blocos();
  ok(JSON.stringify(b2) === JSON.stringify([1,1,1,2,2,2,3,3,3]),
     `Campo/Coleta: ordem por bloco saiu ${b2.join(',')}`);

  /* Ordem dos tratamentos é a DECLARADA, não a alfabética (T2 antes de T10) */
  ev(`document.getElementById('selDesign').value='DIC'; onDesignChange();
      document.getElementById('txtTreatments').value=['T1','T2','T10'].join('\\n');
      document.getElementById('numReps').value='2'; generateCroqui();
      document.getElementById('selColetaSort').value='trat'; onColetaSortChange();`);
  ok(JSON.stringify(trats()) === JSON.stringify(['T1','T1','T2','T2','T10','T10']),
     `Campo/Coleta: T10 deveria vir depois de T2 (ordem declarada), veio ${trats().join(',')}`);

  /* Subamostras */
  ev(`document.getElementById('selDesign').value='DBC'; onDesignChange();
      document.getElementById('txtTreatments').value=['T1','T2','T3'].join('\\n');
      document.getElementById('numReps').value='3'; generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      collectionData={};
      document.getElementById('selColetaSort').value='trat'; onColetaSortChange();
      document.getElementById('numSamples').value='4'; onSamplesChange();`);
  ok(ev('_coletaRows().length') === 36, `Campo/Amostras: 9 parcelas × 4 amostras deveria dar 36 linhas, deu ${ev('_coletaRows().length')}`);
  ok(ev("document.querySelectorAll('#dataBody tr').length") === 36, 'Campo/Amostras: a tabela renderizada não tem 36 linhas');
  ok(ev("document.getElementById('dataHead').textContent").includes('Amostra'), 'Campo/Amostras: cabeçalho sem a coluna Amostra');
  const amostras = JSON.parse(ev("JSON.stringify(_coletaRows().slice(0,5).map(r=>r.s))"));
  ok(JSON.stringify(amostras) === JSON.stringify([1,2,3,4,1]),
     `Campo/Amostras: as amostras deveriam correr dentro da parcela → ${amostras.join(',')}`);

  /* Chave retrocompatível: amostra 1 continua na chave antiga (só o id) */
  ev("collectionData={}; _coletaRows().forEach((r,i)=>{ const k=_cellKey(r.u.id,r.s); (collectionData[k]=collectionData[k]||{}).vA = String(10+i); });");
  const primeiraChave = ev("_cellKey(units[0].id,1)");
  ok(primeiraChave === String(ev('units[0].id')), `Campo/Amostras: amostra 1 mudou de chave (${primeiraChave}) — quebraria projeto salvo`);
  ok(ev("_cellKey(units[0].id,3)") === ev('units[0].id') + '#3', 'Campo/Amostras: chave da amostra 3 fora do formato "<id>#3"');

  /* Média da parcela = média das subamostras (a parcela é a unidade experimental) */
  ev("collectionData={}; const u0=units[0]; [2,4,6,8].forEach((v,i)=>{ const k=_cellKey(u0.id,i+1); (collectionData[k]=collectionData[k]||{}).vA=String(v); });");
  ok(ev("_plotMean(units[0].id,'vA')") === 5, `Campo/Amostras: média da parcela deveria ser 5, veio ${ev("_plotMean(units[0].id,'vA')")}`);

  /* Export segue a ordem escolhida e ganha a coluna Amostra */
  const exp = JSON.parse(ev("JSON.stringify(_buildDataRows())"));
  ok(exp.headers.includes('Amostra'), 'Campo/Export: CSV sem a coluna Amostra com subamostras ligadas');
  ok(exp.rows.length === 36, `Campo/Export: esperava 36 linhas, veio ${exp.rows.length}`);
  const colTrat = exp.headers.indexOf('Tratamento');
  ok(exp.rows[0][colTrat] === 'T1' && exp.rows[35][colTrat] === 'T3', 'Campo/Export: o arquivo não saiu na ordem da tela');

  /* Script R declara a agregação — subamostra não pode virar repetição */
  ev('exportScriptR();');
  const rScript = ev('window.__lastBlob') || '';
  ok(/aggregate\(/.test(rScript) && /pseudorreplica/i.test(rScript),
     'Campo/Script R: sem o bloco de agregação das subamostras (viraria pseudorreplicação)');
  ok(/lmer\(/.test(rScript), 'Campo/Script R: sem a alternativa de modelo misto');

  /* M&M declara as subamostras */
  ok(/subamostras/i.test(ev("buildPublicationText('pt').mm")), 'Campo/M&M: não declara as subamostras');
  ok(/subsample/i.test(ev("buildPublicationText('en').mm")), 'Campo/M&M (EN): não declara as subamostras');

  /* Toda chave da agregação do script R tem de EXISTIR como coluna do CSV.
     Regra derivada do código: pega o descasamento entre o nome que o usuário
     digita e o nome saneado que vai para o arquivo (ex.: DQL com o fator
     renomeado para "Ordem de aplicação" → coluna "Ordem_de_aplica__o"). */
  const chavesBatem = (rotulo) => {
    ev('exportScriptR();');
    const script = ev('window.__lastBlob') || '';
    const bruto  = (/chaves\s+<- c\(([^)]*)\)/.exec(script) || [])[1] || '';
    const chaves = bruto.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    const headers = JSON.parse(ev("JSON.stringify(_buildDataRows().headers)"));
    const nomesVars = JSON.parse(ev("JSON.stringify(projectVariables.map(v=>v.name))"));
    const estruturais = headers.filter(h => h !== 'Amostra' && !nomesVars.includes(h));
    const orfas   = chaves.filter(k => !headers.includes(k));       // aponta p/ coluna inexistente
    const perdidas = estruturais.filter(k => !chaves.includes(k));  // coluna que o aggregate descarta
    ok(chaves.length > 0 && orfas.length === 0 && perdidas.length === 0,
       `Campo/Script R (${rotulo}): agregação ${orfas.length ? 'usa coluna que não existe no CSV → ' + orfas.join(', ') : ''}` +
       `${perdidas.length ? 'descarta coluna estrutural do CSV → ' + perdidas.join(', ') : ''}`);
  };

  ev(`document.getElementById('selDesign').value='DQL'; onDesignChange();
      document.getElementById('dqlTreatments').value=['A','B','C'].join('\\n');
      document.getElementById('dqlRowName').value='Ordem de aplicação';
      document.getElementById('dqlColName').value='Fila/Cova';
      generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      document.getElementById('numSamples').value='3'; onSamplesChange();`);
  chavesBatem('DQL com fator renomeado');

  ev(`document.getElementById('selDesign').value='FAT_DBC'; onDesignChange();
      document.getElementById('fatALevels').value=['A1','A2'].join('\\n');
      document.getElementById('fatBLevels').value=['B1','B2'].join('\\n');
      document.getElementById('numFatBlocks').value='3'; generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      document.getElementById('numSamples').value='3'; onSamplesChange();`);
  chavesBatem('fatorial em blocos');
  ok(ev('_coletaRows().length') === ev('units.length') * 3, 'Campo/Amostras: fatorial não expandiu as linhas por amostra');

  /* Split-plot em DIC: não tem bloco, mas o CSV tem a coluna — e o script usa
     dados$Bloco no psdb(). A agregação não pode descartá-la. */
  ev(`document.getElementById('selDesign').value='SPL_DIC'; onDesignChange();
      document.getElementById('splALevels').value=['P1','P2'].join('\\n');
      document.getElementById('splBLevels').value=['S1','S2'].join('\\n');
      document.getElementById('numSplBlocks').value='3'; generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      document.getElementById('numSamples').value='3'; onSamplesChange();`);
  chavesBatem('split-plot em DIC');

  ev(`document.getElementById('selDesign').value='LATICE'; onDesignChange();
      document.getElementById('numLaticeK').value='3'; generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      document.getElementById('numSamples').value='3'; onSamplesChange();`);
  chavesBatem('látice');
  ok(JSON.parse(ev("JSON.stringify(_buildDataRows().headers)")).includes('Rep'),
     'Campo/Export: látice perdeu a coluna Rep com subamostras');

  /* Volta ao DBC simples para os testes seguintes */
  ev(`document.getElementById('selDesign').value='DBC'; onDesignChange();
      document.getElementById('txtTreatments').value=['T1','T2','T3'].join('\\n');
      document.getElementById('numReps').value='3'; generateCroqui();
      projectVariables=[{id:'vA',name:'Altura',type:'numeric',unit:'cm',decimals:2,options:[]}];
      document.getElementById('numSamples').value='4'; onSamplesChange();`);

  /* Voltar para 1 amostra: some a coluna e o CSV volta ao formato antigo */
  ev("document.getElementById('numSamples').value='1'; onSamplesChange();");
  ok(!JSON.parse(ev("JSON.stringify(_buildDataRows().headers)")).includes('Amostra'),
     'Campo/Amostras: com 1 amostra o CSV não pode ter a coluna Amostra (retrocompatibilidade)');
  ev('exportScriptR();');
  ok(!/aggregate\(/.test(ev('window.__lastBlob') || ''), 'Campo/Script R: agregação apareceu sem subamostras');

  /* Exemplo interno carrega e alimenta a aba Coleta */
  ev("loadExample('milho');");
  ok(ev('units.length') > 0, 'Campo: exemplo interno não gerou croqui');

  /* Modo escuro liga/desliga e persiste */
  ev('toggleDark();');
  ok(ev("document.documentElement.hasAttribute('data-dark')"), 'Campo: modo escuro não ligou');
  ok(ev("localStorage.getItem('agrodesign_dark')") === '1', 'Campo: modo escuro não persistiu');
  ev('toggleDark();');
  ok(!ev("document.documentElement.hasAttribute('data-dark')"), 'Campo: modo escuro não desligou');

  ok(erros.length === 0, `Campo: erro de runtime durante os fluxos → ${erros.join(' | ')}`);
  fechar();
}

async function smokeLab(jsdom) {
  secao('▸ jsdom — Lab (AgroDesignLab.html)');
  const { w, erros, fechar } = await boot(jsdom, 'AgroDesignLab.html');
  const ev = expr => w.eval(expr);

  ok(erros.length === 0, `Lab: erro de runtime no boot → ${erros.join(' | ')}`);
  ok(ev('typeof generatePlate') === 'function', 'Lab: generatePlate não existe após o boot');
  ok(ev("document.getElementById('appVersion').textContent").includes('v' + ev('LAB_VERSION')),
     `Lab: rodapé mostra "${ev("document.getElementById('appVersion').textContent")}" em vez da versão do código (v${ev('LAB_VERSION')})`);

  /* MIC (CRD) — placa de 96 poços */
  ev("loadTemplate('mic');");
  ok(ev('plateLayout.length') === 96, `Lab/MIC: esperava 96 poços, veio ${ev('plateLayout.length')}`);
  ok(ev("document.querySelectorAll('#plateSvg circle, #plateSvg rect').length") > 0, 'Lab: SVG da placa sem poços');
  ok(ev("plateLayout.filter(p=>p.type==='sample').length") > 0, 'Lab/MIC: nenhum poço de amostra');

  /* Semente reprodutível */
  const arranjo = () => ev("plateLayout.map(p=>p.treatment).join('|')");
  const a1 = arranjo();
  ev('generatePlate(true);');
  ok(arranjo() === a1, 'Lab: mesma semente gerou placa diferente');
  ev("document.getElementById('numSeedLab').value='7'; generatePlate(true);");
  ok(arranjo() !== a1, 'Lab: semente diferente gerou a mesma placa');

  /* RCBD por linha (v2.1.0) — bloco COMPLETO: cada tratamento 1× por bloco */
  ev(`loadTemplate('crd');
      document.getElementById('txtTreatments').value=['A','B','C','D'].join('\\n');
      document.getElementById('numReps').value='3';
      document.getElementById('numCtrlNeg').value='0';
      document.getElementById('numCtrlPos').value='0';
      document.getElementById('numBlank').value='0';
      document.getElementById('selDesignLab').value='RCBD-R'; onDesignChange();
      document.getElementById('numSeedLab').value='42';
      generatePlate(true);`);
  const amostras = JSON.parse(ev("JSON.stringify(plateLayout.filter(p=>p.type==='sample').map(p=>({b:p.block,t:p.treatment})))"));
  ok(amostras.length === 12, `Lab/RCBD-R: esperava 12 poços de amostra, veio ${amostras.length}`);
  const blocos = [...new Set(amostras.map(a => a.b))];
  ok(blocos.length === 3, `Lab/RCBD-R: esperava 3 blocos, veio ${blocos.length}`);
  ok(blocos.every(b => {
    const ts = amostras.filter(a => a.b === b).map(a => a.t);
    return ts.length === 4 && new Set(ts).size === 4;
  }), 'Lab/RCBD-R: bloco incompleto (tratamento repetido ou faltando dentro do bloco)');

  /* MTT — borda sacrificial vira buffer */
  ev("loadTemplate('mtt');");
  const borda = JSON.parse(ev("JSON.stringify(plateLayout.filter(p=>p.row==='A'||p.row==='H'||p.col===1||p.col===12).map(p=>p.type))"));
  ok(borda.length === 36 && borda.every(t => t === 'buffer'),
     'Lab/MTT: borda sacrificial não marcou os 36 poços periféricos como buffer');

  /* EcoPlate — layout fixo com os 3 controles de água */
  ev("loadTemplate('ecoplate');");
  ok(ev('plateLayout.length') === 96, 'Lab/EcoPlate: placa não tem 96 poços');
  const agua = JSON.parse(ev("JSON.stringify(['A1','A5','A9'].map(id=>(plateLayout.find(p=>p.id===id)||{}).treatment))"));
  ok(agua.every(t => /gua|H₂O|H2O/i.test(String(t))), `Lab/EcoPlate: A1/A5/A9 deveriam ser controle de água, vieram ${agua.join(', ')}`);

  /* Abas */
  ev("switchTab('fieldbook');");
  ok(ev("document.getElementById('tabFieldbook').classList.contains('active')"), 'Lab: switchTab não ativou o Field Book');
  ev("switchTab('placa');");
  ok(ev("document.getElementById('tabPlaca').classList.contains('active')"), 'Lab: switchTab não voltou para a Placa');

  /* Modo escuro */
  ev('toggleDark();');
  ok(ev("document.documentElement.hasAttribute('data-dark')"), 'Lab: modo escuro não ligou');
  ok(ev("localStorage.getItem('agrodesignlab_dark')") === '1', 'Lab: modo escuro não persistiu');
  ev('toggleDark();');

  ok(erros.length === 0, `Lab: erro de runtime durante os fluxos → ${erros.join(' | ')}`);
  fechar();
}

/* Banner "nova versão disponível" (§14): compara o app_config do Supabase com a
   constante local. É um mecanismo que morre calado — se ninguém publicar a versão
   nova no backend, ele simplesmente nunca aparece, sem erro nenhum. */
async function smokeBanner(jsdom) {
  secao('▸ jsdom — banner de nova versão (§14)');
  const espera = ms => new Promise(r => setTimeout(r, ms));

  /* Os dois módulos implementam o banner diferente: o Campo tem markup fixo que
     sai do .hidden; o Lab cria o elemento na hora. "Visível" cobre os dois. */
  const visivel = "(() => { const b = document.getElementById('updateBanner');" +
                  " return !!b && !b.classList.contains('hidden'); })()";
  const texto   = "((document.getElementById('updateBanner')||{}).textContent || '')";

  for (const arquivo of ['AgroDesign.html', 'AgroDesignLab.html']) {
    const nome = arquivo.includes('Lab') ? 'Lab' : 'Campo';

    // backend anunciando versão MAIOR → banner tem de aparecer
    let ctx = await boot(jsdom, arquivo, { cfgVersion: '99.0.0' });
    await espera(300);   // a checagem é assíncrona (fase tardia — r38b)
    ok(ctx.w.eval(visivel), `${nome}: backend anunciando v99.0.0 e o banner de atualização não apareceu`);
    ok(/99\.0\.0/.test(ctx.w.eval(texto)), `${nome}: banner apareceu sem dizer qual é a versão nova`);
    ctx.fechar();

    // backend com versão MENOR → nada de banner (nunca oferecer downgrade)
    ctx = await boot(jsdom, arquivo, { cfgVersion: '0.0.1' });
    await espera(300);
    ok(!ctx.w.eval(visivel), `${nome}: banner apareceu para uma versão MAIS ANTIGA que a local`);
    ctx.fechar();

    // backend na MESMA versão → nada de banner (é o estado de hoje em produção)
    ctx = await boot(jsdom, arquivo, { cfgVersion: null });
    await espera(300);
    ok(!ctx.w.eval(visivel), `${nome}: banner apareceu sem versão nova publicada`);
    ctx.fechar();
  }
}

/* ═════════════════════════════ EXECUÇÃO ═════════════════════════════ */

(async () => {
  console.log('AgroDesign — verificação antes de subir (§35)');
  estatico();

  const jsdom = carregaJsdom();
  if (!jsdom) {
    if (process.env.CI) {
      fails.push('CI sem jsdom: o smoke não rodou (instale com `npm install --no-save --no-package-lock jsdom`)');
      console.log('\n   ✗ CI sem jsdom — o degrau de boot não rodou.');
    } else {
      console.log('\n▸ jsdom ausente — só o degrau estático rodou.');
      console.log('  Para o smoke completo: npm install --no-save --no-package-lock jsdom');
    }
  } else {
    try { await smokeCampo(jsdom);  } catch (e) { ok(false, `Campo: smoke abortou — ${e.message}`); }
    try { await smokeLab(jsdom);    } catch (e) { ok(false, `Lab: smoke abortou — ${e.message}`); }
    try { await smokeBanner(jsdom); } catch (e) { ok(false, `Banner: smoke abortou — ${e.message}`); }
  }

  console.log(`\n${fails.length === 0 ? '✓' : '✗'} ${pass} ✓ · ${fails.length} ✗`);
  process.exit(fails.length === 0 ? 0 : 1);
})();
