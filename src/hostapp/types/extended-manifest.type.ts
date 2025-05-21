type ExtendedManifestItem = {
  uri: string,
  route: string,
  module: string,
  roles: string,
  name: string
};

type ExtendedManifestType = Record<string, ExtendedManifestItem>;

export {ExtendedManifestType, ExtendedManifestItem};
