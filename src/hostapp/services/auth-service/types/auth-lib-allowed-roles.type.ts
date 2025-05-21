type AuthLibAllowedRolesItem = {
  userRoles: string[],
  adminRoles: string[]
}

type AuthLibAllowedRoles = Record<string, AuthLibAllowedRolesItem>;

export {AuthLibAllowedRolesItem, AuthLibAllowedRoles}
