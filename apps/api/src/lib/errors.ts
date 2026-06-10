export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return { error: this.message, code: this.code, status: this.statusCode };
  }
}

export class NotFoundError extends ApiError {
  constructor(m = 'Resource not found') { super(404, m, 'NOT_FOUND'); }
}
export class UnauthorizedError extends ApiError {
  constructor(m = 'Unauthorized') { super(401, m, 'UNAUTHORIZED'); }
}
export class ForbiddenError extends ApiError {
  constructor(m = 'Forbidden') { super(403, m, 'FORBIDDEN'); }
}
export class PaymentRequiredError extends ApiError {
  constructor(m = 'Payment required') { super(402, m, 'PAYMENT_REQUIRED'); }
}
export class ConflictError extends ApiError {
  constructor(m = 'Conflict') { super(409, m, 'CONFLICT'); }
}
export class RateLimitedError extends ApiError {
  constructor(m = 'Rate limited') { super(429, m, 'RATE_LIMITED'); }
}
