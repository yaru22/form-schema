export class FormError extends Error {
  constructor(reasons, data) {
    super();
    this.name = 'FormError';
    this.reasons = reasons;
    this.data = data;
    Error.captureStackTrace(this, FormError);
  }
}

export function formError(...args) {
  return new FormError(...args);
}
