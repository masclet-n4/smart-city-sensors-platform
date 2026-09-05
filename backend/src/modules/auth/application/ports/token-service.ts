export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  userId: string;
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
