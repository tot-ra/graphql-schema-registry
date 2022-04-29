import { Logger, TLogLevelName, ISettingsParam } from "tslog";

const logger = new Logger({
	minLevel: (process.env.LOG_LEVEL || "info") as TLogLevelName,
	type: (process.env.LOG_TYPE || "pretty" ) as ISettingsParam["type"]
  });

export function getLogger() {
	return logger
}
