export type ResolveType = (value: boolean | PromiseLike<boolean>) => void;
export type AuthContext =  {
  userName: string,
  userRoles: string[],
  logoutFunc: (resolve?: ResolveType) => void,
  sessionId?: string
}
