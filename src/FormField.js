export default class FormField {
  constructor(...args) {
    this._validators = args;
  }

  isRequired() {
    this._isRequired = true;
    return this;
  }

  validate(value, dataRoot) {
    if (typeof value === 'undefined') {
      return this._isRequired ? {
        isValid: false,
        errors: ['The field is required.'],
      } : {
        isValid: true,
        errors: [],
      };
    }
    const result = this._validators.reduce(({ isValid, errors }, validator) => {
      const { isValid: valid, error } = validator(value, dataRoot);
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
