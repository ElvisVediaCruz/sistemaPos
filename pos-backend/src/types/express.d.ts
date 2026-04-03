import { UserTipo } from '../models/Usuario';

export interface JwtPayload {
  id_usuario: number;
  user_name: string;
  tipo: UserTipo;
  id_vendedor?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
