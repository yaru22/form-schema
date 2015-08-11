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
    return {
      ...result,
      data: value,
    };
  }
}

export function field(...args) {
  return new FormField(...args);
}

function _validateHelper(data, schema) {
  let dataType = typeof data;
  dataType = (dataType === 'object' && Array.isArray(data)) ? 'array' : dataType;

  if (schema instanceof FormField) {
    // NOTE: You cannot assume the data at this point is a primitive.
    const result = schema.validate(data);
    return result;
  } else if (Array.isArray(schema)) {  // array
    if (Array.isArray(data)) {
      // iterate array and validate element
      const resultArr = data.map(x => _validateHelper(x, schema[0]));
      const isValid = resultArr.every(x => x.isValid);
      return {
        isValid,
        result: resultArr,
      };
    }
    return {
      isValid: false,
      errors: [`Expected an array but got a ${dataType}.`],
    };
  } else if (typeof schema === 'object') {  // object
    if (dataType === 'object') {
      // iterate key and validate value
      const resultObj = Object.keys(schema).reduce((acc, key) => {
        acc[key] = _validateHelper(data[key], schema[key]);
        return acc;
      }, {});
      const isValid = Object.keys(resultObj).every(key => resultObj[key].isValid);
      return {
        isValid,
        result: resultObj,
      };
    }
    return {
      isValid: false,
      errors: [`Expected an object but got a ${dataType}.`],
    };
  }
  throw new Error('wtf?');
}

function _compactResult(result) {
  if (result.isValid) {
    return null;
  } else if (result.result) {
    const subResult = result.result;
    if (Array.isArray(subResult)) {
      return subResult.map(_compactResult);
    } else if (typeof subResult === 'object') {
      return Object.keys(subResult).reduce((acc, key) => {
        acc[key] = _compactResult(subResult[key]);
        return acc;
      }, {});
    }
    throw new Error('wtf2');
  }
  return result.errors;
}

export default function validate(data, schema) {
  const result = _validateHelper(data, schema);
  const compactResult = _compactResult(result);
  return {
    isValid: result.isValid,
    errors: compactResult,
  };
}
