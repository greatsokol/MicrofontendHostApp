import {InjectionToken} from "@angular/core";
import {ExtendedManifestType} from "../types/extended-manifest.type";

export const MANIFEST_TOKEN = new InjectionToken<ExtendedManifestType>("MANIFEST_TOKEN");
