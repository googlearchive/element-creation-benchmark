var fs = require('fs');
var path = require('path');

function bowerToDeps(b) {
  var json = JSON.parse(b);
  return Object.keys(json.dependencies || {});
}

function readBowerJson(d) {
  var file = path.join(d, 'bower.json');
  if (existsSync(file)) {
    return fs.readFileSync(file, 'utf-8');
  } else {
    return '{}';
  }
}

function existsSync(fn) {
  try {
    fs.statSync(fn);
    return true;
  } catch(_) {
    return false;
  }
}

function mapAll(dir, seenSet, top) {
  dir = path.join(top ? __dirname : 'bower_components', dir);
  var next = bowerToDeps(readBowerJson(dir));
  next.forEach(n => {
    if (!seenSet.has(n)) {
      seenSet.add(n);
      mapAll(n, seenSet);
    }
  });
}

var seenSet = new Set();
mapAll('.',  seenSet, true);
var folders = Array.from(seenSet);
var imports = folders.filter(f => existsSync(path.join('bower_components', f, `${f}.html`)));
console.log(imports.map(f => `<link rel="import" href="bower_components/${f}/${f}.html">`).join('\n'));
console.log('<dom-module id="all-elements"><template>');
console.log(imports.map(f => `<${f}></${f}>`).join('\n'));
console.log('</template><script>Polymer({is: "all-elements", ready: function(){console.log(performance.now() - window.start);}});</script></dom-module>');
