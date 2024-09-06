const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  shared: {
    // ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    "@angular/core": {singleton: true, strictVersion: true},
    "@angular/common": {singleton: true, strictVersion: true},
    "@angular/router": {singleton: true, strictVersion: true},
    "@angular/animations": {singleton: true, strictVersion: true},
    "@angular/compiler": {singleton: true, strictVersion: true},
    "@angular/forms": {singleton: true, strictVersion: true},
    "@angular/platform-browser": {singleton: true, strictVersion: true},
    "tslib": {singleton: true, strictVersion: true},
    "keycloak-angular": {singleton: true, strictVersion: true},
    "bootstrap": {singleton: true, strictVersion: true},
    "@@auth-lib": {singleton: true, strictVersion: true},
  },

});
