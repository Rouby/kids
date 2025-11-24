declare module 'bun:sqlite' {
  export class Database {
    constructor(filename: string, options?: { readonly?: boolean; create?: boolean });
    close(): void;
    exec(query: string): void;
    prepare(query: string): Statement;
    query(query: string): Statement;
    run(query: string, ...params: unknown[]): void;
  }

  export class Statement {
    run(...params: unknown[]): void;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    values(...params: unknown[]): unknown[][];
    finalize(): void;
  }
}
