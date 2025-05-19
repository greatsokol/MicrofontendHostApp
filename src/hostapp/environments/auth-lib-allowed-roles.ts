import {AuthLibAllowedRoles} from "../services/auth-service";


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
