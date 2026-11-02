const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const dom = new JSDOM('', { runScripts: 'outside-only' });
const { window } = dom;
window.Vue = { extend: x => x, component: () => {}, filter: () => {} };
window.eval(fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8'));
const { document, util } = window;

const check = (html, selector, attribute, expected) => {
  const container = document.createElement('div');
  container.innerHTML = util.sanitize(html);
  const actual = container.querySelector(selector).getAttribute(attribute);
  if (actual !== expected) throw new Error(JSON.stringify({html, actual, expected}));
};
check('<a href="java&#x0a;script:alert(1)">x</a>', 'a', 'href', null);
check('<a href="jav&#x09;ascript:alert(1)">x</a>', 'a', 'href', null);
check('<iframe src="data:text/html,<script>alert(1)</script>"></iframe>', 'iframe', 'src', null);
check('<iframe src="data:application/xhtml+xml,example"></iframe>', 'iframe', 'src', null);
check('<a href="mailto:hello@example.com">x</a>', 'a', 'href', 'mailto:hello@example.com');
check('<a href="https://example.com/a">x</a>', 'a', 'href', 'https://example.com/a');
check('<a href="/post/1">x</a>', 'a', 'href', '/post/1');
check('<img src="image.png" onerror="alert(1)">', 'img', 'onerror', null);
check('<a href="https://example.com">x</a>', 'a', 'rel', 'noopener noreferrer');

check('<a href="tel:+1234">x</a>', 'a', 'href', 'tel:+1234');
check('<a href="//example.com/a">x</a>', 'a', 'href', '//example.com/a');
check('<img src="data:image/png;base64,aGVsbG8=">', 'img', 'src', 'data:image/png;base64,aGVsbG8=');
check('<a href="ftp://example.com/a">x</a>', 'a', 'href', 'ftp://example.com/a');
dom.window.close();
console.log('13 sanitizer DOM regressions passed');
