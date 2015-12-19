export class FormFieldError extends Error {
  constructor(reasons, data) {
    super();
    this.name = 'FormFieldError';
    this.reasons = reasons;
    this.data = data;
    Error.captureStackTrace(this, FormFieldError);
  }
}

export function formFieldError(...args) {
  return new FormFieldError(...args);
}
