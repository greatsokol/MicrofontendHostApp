type ExtendedManifestItem = {
  uri: string,
  route: string,
  exposedModule: string,
  module: string,
  roles: string,
  name: string
};

type ExtendedManifestType = Record<string, ExtendedManifestItem>;

export {ExtendedManifestType, ExtendedManifestItem};
