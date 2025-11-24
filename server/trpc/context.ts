import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export interface Context {
  req: Request;
  resHeaders: Headers;
}

export const createContext = async ({
  req,
  resHeaders,
}: FetchCreateContextFnOptions): Promise<Context> => {
  return {
    req,
    resHeaders,
  };
};
