import { EnvVariables, envSchema } from "./env.schema";

export function validate(config: Record<string, any>): EnvVariables {
  return envSchema.parse(config);
}
