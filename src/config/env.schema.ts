import { z } from "zod";

/** Zod schema used to validate environment config */
export const envSchema = z.object({
  PORT: z.coerce.number(),
});

/** Type for environment variables */
export type EnvVariables = z.infer<typeof envSchema>;
