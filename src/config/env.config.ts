import { EnvVariables, envSchema } from "./env.schema";

/** Validates environment config based on zod schema */
export function validate(config: Record<string, any>): EnvVariables {
  return envSchema.parse(config);
}
