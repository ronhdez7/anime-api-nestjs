import { AxiosError } from "axios";

/** Formats error cause to be usable */
export function formatErrorCause(exception: unknown) {
  return exception instanceof AxiosError
    ? exception.toJSON()
    : exception instanceof Error
      ? {
          ...exception,
          name: exception.name,
          message: exception.message,
          stack: undefined,
        }
      : exception;
}
