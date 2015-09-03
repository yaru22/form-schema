export default class FormField {
  constructor(attrs) {
    this._attrs = attrs;
  }

  validators(...args) {
    this._validators = args;
    return this;
  }

  isRequired() {
    this._isRequired = true;
    return this;
  }

  getAttributes() {
    return this._attrs;
  }

  validate(value, ...rest) {
    if (typeof value === 'undefined' || (value === null && typeof value === 'object')) {
      return this._isRequired ? {
        isValid: false,
        errors: ['The field is required.'],
      } : {
        isValid: true,
        errors: [],
      };
    }
    const result = this._validators.reduce(({ isValid, errors }, validator) => {
      const { isValid: valid, error } = validator(value, ...rest);
      if (!valid) {
        errors.push(error);
      }
      return {
        isValid: isValid && valid,
        errors,
      };
    }, {
      isValid: true,
      errors: [],
    });
    return {
      ...result,
      data: value,
    };
  }
}
