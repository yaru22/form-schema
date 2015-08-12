export default class FormFieldError extends Error {
  constructor(reasons, data) {
    super();
    this.name = 'FormFieldError';
    this.reasons = reasons;
    this.data = data;
    Error.captureStackTrace(this, FormFieldError);
  }
}
