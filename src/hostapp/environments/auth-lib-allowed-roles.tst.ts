import {AuthLibAllowedRoles} from "oidc-auth-lib";

export const authLibAllowedRoles: AuthLibAllowedRoles = {
  kcusers: {
    userRoles: [
      "user"
    ],
    adminRoles: [
      "admin"
    ]
  },
  auth_finstar: {
     adminRoles: ['admin'],
     userRoles: ['user']
   }
}
