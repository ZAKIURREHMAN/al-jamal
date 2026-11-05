import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

/** Wrap a route handler so thrown errors become consistent JSON responses. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(400, "Validation failed", err.flatten().fieldErrors);
      }
      if (err instanceof ApiError) {
        return fail(err.status, err.message, err.details);
      }
      logger.error("Unhandled API error", err);
      return fail(500, "Something went wrong. Please try again.");
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}
