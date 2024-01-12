import { z } from "zod";

export const urlQueryParam = z.string().url();
