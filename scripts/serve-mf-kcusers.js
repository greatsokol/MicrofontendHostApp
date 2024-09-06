const compression = require('compression');
const express = require('express');
const fs = require('fs');
const {createProxyMiddleware} = require('http-proxy-middleware');
const app = express();
const https = require('https');
const cors = require("cors");
//const Transform = require("stream").Transform;


app.use(compression());
app.use(express.static('dist/host', {maxAge: 0, index: false}));
//app.use('/management', createProxyMiddleware({target: 'http://localhost:8083', changeOrigin: true}));
// If you want to try webapp with an other target
// app.use('/management', createProxyMiddleware({ target: 'https://apim-master-api.cloud.gravitee.io', changeOrigin: true, secure: false }));

// app.all('/*', (req, res) => {
//   res.sendFile('index.html', { root: 'dist/' });
// });

const localDir = "dist/mf-kcusers";
const port = 4202;
const nonce = '111';
const dataUrl = "https://kcusers.local";
const kcUrl = "https://keycloak.local";
const allowedUrls = dataUrl + ' ' + kcUrl;

app.use(cors());
app.all("/*", (req, res) => {
  let data = fs.readFileSync(localDir + '/index.html', 'utf8');

  let data_nonced = data.replaceAll('**CSP_NONCE**', nonce)
    .replaceAll('<script', '<script nonce="' + nonce + '" ')
    .replaceAll('<link', '<link nonce="' + nonce + '" ')
    .replaceAll('<style', '<style nonce="' + nonce + '" ');

  res.setHeader("Content-Security-Policy-Report-Only",
    "default-src 'self' " + allowedUrls + "; " +
    "style-src 'self' 'nonce-" + nonce + "';" +
    "script-src 'self' 'strict-dynamic' 'nonce-" + nonce + "';" +
    "font-src 'self' data: " + allowedUrls + ";");

  //res.setHeader("Content-Security-Policy", "trusted-types angular angular#unsafe-bypass; require-trusted-types-for 'script';");
  res.status(200).send(data_nonced);
});

const privateKey = fs.readFileSync('certs/any.local.key', 'utf8');
const certificate = fs.readFileSync('certs/any.local.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
console.log('App listening at https://localhost:' + port);
httpsServer.listen(port);
