import { Config, Schema } from "effect"

/** Process configuration for the self-hosted server (environment variables). */
export const ServerConfig = Config.all({
  port: Config.Port("PORT").pipe(Config.withDefault(3000)),
  host: Config.String("HOST").pipe(Config.withDefault("127.0.0.1")),
  databaseFile: Config.String("DADALINK_DB_FILE").pipe(Config.withDefault("./data/dadalink.db")),
  allowedOrigins: Config.Array(Schema.String, "DADALINK_ALLOWED_ORIGINS").pipe(Config.option)
})
