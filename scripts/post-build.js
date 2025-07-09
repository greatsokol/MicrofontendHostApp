const fs = require('fs');
const path = require('path');
const pathToIndexHtml = path.resolve(__dirname, '../dist/mf-host/index.html');

  fs.readFile(pathToIndexHtml, 'utf8', function (err, data){
  if(err) {
    return console.log(err);
  }
  const result = data.toString().replace(/<(script|link|style)/g, '<$1 nonce="**CSP_NONCE**"');
  fs.writeFile(pathToIndexHtml, result, 'utf8',  function (err){
    if(err) {
      return console.log(err);
    }
    console.log('Injected **CSP_NONCE** successfully');
  });
});
