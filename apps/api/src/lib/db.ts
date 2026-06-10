import type { D1Database } from '@cloudflare/workers-types';

/** Typed D1 helper */
export function getDb(db: D1Database) {
  return {
    /** Single row query */
    async one<T>(sql: string, ...params: unknown[]): Promise<T | null> {
      const r = db.prepare(sql).bind(...params).first();
      return r as Promise<T | null>;
    },

    /** Multiple rows query */
    async many<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      const r = db.prepare(sql).bind(...params).all();
      return (r.results ?? []) as T[];
    },

    /** Execute write operation */
    async execute(sql: string, ...params: unknown[]): Promise<D1Result> {
      return db.prepare(sql).bind(...params).run();
    },

    /** Transactional batch */
    async batch(stmts: D1PreparedStatement[]): Promise<D1Result[]> {
      return db.batch(...stmts);
    },
  };
}
