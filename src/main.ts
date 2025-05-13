import {initFederation} from "@angular-architects/module-federation";
import {manifest} from "./manifests/mf.manifest";

initFederation(manifest)
  .catch(err => console.error(err))
  .then(_ => import("./bootstrap"))
  .catch(err => console.error(err));

// loadManifest("assets/mf.manifest.json", true)
//   .catch(err => console.error(err))
//   .then(_ => import("./bootstrap"))
//   .catch(err => console.error(err));
