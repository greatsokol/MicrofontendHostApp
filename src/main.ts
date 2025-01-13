import { loadManifest } from "@angular-architects/module-federation";

loadManifest("/assets/mf.manifest.json", true)
  .catch(err => console.error(err))
  .then(_ => import("./bootstrap"))
  .catch(err => console.error(err));
