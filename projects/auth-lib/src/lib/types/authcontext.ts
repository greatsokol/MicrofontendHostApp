export type AuthContext =  {
  userName: string,
  userRoles: string[],
  logoutFunc: () => void,
  profileId?: string,
  sessionId?: string
}
