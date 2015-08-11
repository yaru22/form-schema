class FormField {
  constructor(...args) {
    this.validators = args;
  }

  validate(value) {
    const result = this.validators.reduce(({ isValid, errors }, validator) => {
      const { isValid: valid, error } = validator(value);
      if (!valid) {
        errors.push(error || valid);
      }
      return {
        isValid: isValid && valid,
        errors,
      };
    }, {
      isValid: true,
      errors: [],
    });
    return result;
  }
}

export function field(...args) {
  return new FormField(...args);
}

export default function validate(data, schema) {
  let dataType = typeof data;
  dataType = (dataType === 'object' && Array.isArray(data)) ? 'array' : dataType;

  if (schema instanceof FormField) {
    // NOTE: You cannot assume the data at this point is a primitive.
    const result = schema.validate(data);
    return result;
  } else if (Array.isArray(schema)) {  // array
    if (Array.isArray(data)) {
      // iterate array and validate element
      const resultArr = data.map(x => validate(x, schema[0]));
      return resultArr;
    }
    return {
      isValid: false,
      errors: [`Expected an array but got a ${dataType}.`],
    };
  } else if (typeof schema === 'object') {  // object
    if (dataType === 'object') {
      // iterate key and validate value
      const resultObj = Object.keys(schema).reduce((acc, key) => {
        acc[key] = validate(data[key], schema[key]);
        return acc;
      }, {});
      return resultObj;
    }
    return {
      isValid: false,
      errors: [`Expected an object but got a ${dataType}.`],
    };
  }
  throw new Error('wtf?');
}
