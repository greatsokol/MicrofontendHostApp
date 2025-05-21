import {initFederation} from "@angular-architects/module-federation";
import {ManifestType} from "./hostapp/types/manifest.type";
import {ExtendedManifestItem, ExtendedManifestType} from "./hostapp/types/extended-manifest.type";

const convertExtendedManifest = (extendedManifest: ExtendedManifestType) => {
  const manifest: ManifestType = {}
  for (const [key, value] of Object.entries<ExtendedManifestItem>(extendedManifest)) {
    manifest[key] = value.uri;
  }
  return manifest;
}

const loadExtendedManifest = () => {
  fetch("assets/mf.manifest.json").then(
    response => {
      if (!response.ok) {
        throw new Error(`Error on assets/mf.manifest.json load: ${response.status}`);
      }
      return response.json();
    }
  ).then(json => {
      initFederation(convertExtendedManifest(json))
        .then(_ => import("./bootstrap"))
        .catch(err => console.error(err));
    }
  )
}

loadExtendedManifest();
