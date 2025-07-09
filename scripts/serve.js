const compression = require('compression');
const express = require('express');
const fs = require('fs');
const app = express();
const https = require('https');
const cors = require("cors");

const rootDir = "dist/mf-host";
const port = 4200;
const nonce = 'random-nonce';
const dataUrl = "https://kcusers.local";
const kcUrl = "https://keycloak.local";
//const allowedUrls = dataUrl + ' ' + kcUrl + ' https://localhost:4202 https://localhost:4203 https://localhost:3000';
const allowedUrls = dataUrl + ' ' + kcUrl;// + ' https://localhost:4202 https://localhost:4203 https://localhost:3000';

app.use(cors());
app.use(compression());
app.use(express.static(rootDir, {maxAge: 0, index: false}));
app.all("/*", (req, res) => {
  let data = fs.readFileSync(rootDir + '/index.html', 'utf8');

  let data_nonced
    = data.replaceAll('**CSP_NONCE**', nonce);

  res.setHeader('Content-Security-Policy',
    `default-src 'strict-dynamic' 'self' 'nonce-${nonce}';`+
          `style-src 'strict-dynamic' 'self' 'nonce-${nonce}';`+
          `script-src 'strict-dynamic' 'self' 'nonce-${nonce}';`+
          `img-src 'self' data: w3.org/svg/2000;`+
          `connect-src ${allowedUrls};`);


  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type, Authorization");

  res.status(200).send(data_nonced);
});

const privateKey = fs.readFileSync('certs/localhost.key', 'utf8');
const certificate = fs.readFileSync('certs/localhost.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
console.log('App listening at https://localhost:' + port);
httpsServer.listen(port);

