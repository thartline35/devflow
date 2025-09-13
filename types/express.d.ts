// types/express.d.ts
import 'express-serve-static-core';
import { AuthUser } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
