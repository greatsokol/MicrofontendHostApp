import {initFederation} from "@angular-architects/module-federation";
import {ManifestType} from "./hostapp/types/manifest.type";
import {ExtendedManifestItem, ExtendedManifestType} from "./hostapp/types/extended-manifest.type";
import {manifest} from "./hostapp/environments";

const convertExtendedManifest = (extendedManifest: ExtendedManifestType) => {
  const manifest: ManifestType = {}
  for (const [key, value] of Object.entries<ExtendedManifestItem>(extendedManifest)) {
    manifest[key] = value.uri;
  }
  return manifest;
}

initFederation(convertExtendedManifest(manifest), true)
  .then(_ => import("./bootstrap"))
  .catch(err => console.error(err));
