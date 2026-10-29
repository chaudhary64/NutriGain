/**
 * Which database to connect to.
 *
 * Precedence: MONGODB_DB, then the database named in the connection string,
 * then the project default.
 *
 * The default used to be hardcoded into the connection options, which silently
 * overrode whatever the URI said — so a second environment could not point at
 * its own database without editing code. Keeping the same default here means
 * the current deployment (whose URI carries no database path) is unchanged,
 * while a URI that names a database is now honoured.
 *
 * Lives in its own module because the ops scripts need it too, and importing
 * lib/mongodb.js from a script would read the environment before the script's
 * .env loading has run.
 */
export const DEFAULT_DB_NAME = 'nutrigain';

export function resolveDbName(
  uri = process.env.MONGODB_URI,
  override = process.env.MONGODB_DB
) {
  if (override) return override;

  if (typeof uri === 'string' && uri.trim() !== '') {
    try {
      const name = new URL(uri).pathname.replace(/^\/+/, '').trim();
      if (name) return name;
    } catch {
      // Not a URL we can parse: fall through to the default and let the driver
      // report the malformed URI itself.
    }
  }

  return DEFAULT_DB_NAME;
}
