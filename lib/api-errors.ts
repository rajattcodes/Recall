import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logError } from "./error-logger";

export interface ApiErrorResponse {
  error: string;
  details?: string | string[];
  code?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: string | string[],
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  toResponse(): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        error: this.message,
        ...(this.details && { details: this.details }),
        ...(this.code && { code: this.code }),
      },
      { status: this.statusCode }
    );
  }
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  if (error instanceof ZodError) {
    const details = error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
    return NextResponse.json(
      {
        error: "Validation failed",
        details,
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    logError(error, { context: "api_error" });
    
    if (error.message.includes("Invalid state transition")) {
      return NextResponse.json(
        {
          error: "Invalid state transition",
          details: error.message,
          code: "STATE_MACHINE_ERROR",
        },
        { status: 400 }
      );
    }
    
    const errorAny = error as any;
    if (errorAny.code === "P2002") {
      return NextResponse.json(
        {
          error: "A resource with this value already exists",
          code: "DUPLICATE_ENTRY",
        },
        { status: 409 }
      );
    }
    
    if (errorAny.code === "P2025") {
      return NextResponse.json(
        {
          error: "Record not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  logError(new Error("Unknown error"), { originalError: error });
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: string | string[],
  code?: string
): NextResponse<ApiErrorResponse> {
  return new ApiError(message, statusCode, details, code).toResponse();
}

export function createNotFoundError(resource: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    `${resource} not found`,
    404,
    undefined,
    "NOT_FOUND"
  );
}

export function createUnauthorizedError(): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    "Unauthorized",
    401,
    undefined,
    "UNAUTHORIZED"
  );
}

export function createValidationError(details: string | string[]): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    "Validation failed",
    400,
    details,
    "VALIDATION_ERROR"
  );
}

export function createConflictError(message: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    message,
    409,
    undefined,
    "CONFLICT"
  );
}
