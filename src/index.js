import { formError, FormError } from './FormError';
import { FormField } from './FormField';
import { formFieldError, FormFieldError } from './FormFieldError';

//
// NOTE: Couldn't put Form class into its own file src/Form.js because doing so
// would result in a Webpack build error "a dependency to an entry point is not allowed".
// See https://github.com/webpack/webpack/issues/300 for more details.
// It's quite a peculiar error. Probably the cause of the error is the circular
// dependency between src/Form.js and src/index.js. Until the library is re-designed
// to avoid such circular dependency, Form class will reside in this file.
//

export class Form {
  constructor(schema) {
    this._schema = schema;
  }

  getSchema() {
    return this._schema;
  }

  required() {
    this._isRequired = true;
    return this;
  }

  validate(data, ...rest) {
    if (typeof data === 'undefined' || (data === null && typeof data === 'object')) {
      return this._isRequired ? {
        isValid: false,
        errors: ['The form is required.'],
      } : {
        isValid: true,
        errors: [],
      };
    }
    /* eslint-disable no-use-before-define */
    const result = validateHelper(data, this._schema, ...rest);
    /* eslint-enable no-use-before-define */
    return result;
  }
}

export const ANY_KEY = Symbol('any key');

export function form(...args) {
  return new Form(...args);
}

export function field(...args) {
  return new FormField(...args);
}

export { FormError, FormFieldError };

function validateHelper(data, _schema, ancestors = [], keyPath = []) {
  let dataType = typeof data;
  dataType = (dataType === 'object' && Array.isArray(data)) ? 'array' : dataType;

  let schema = _schema;
  if (typeof schema === 'function') {
    schema = _schema();
  }

  if (schema instanceof Form) {
    const result = schema.validate(data, ancestors, keyPath);
    result.errorFactory = formError;
    return result;
  } else if (schema instanceof FormField) {
    // NOTE: You cannot assume the data at this point is a primitive.
    const result = schema.validate(data, ancestors, keyPath);
    result.errorFactory = formFieldError;
    return result;
  } else if (Array.isArray(schema)) {  // array
    if (Array.isArray(data)) {
      // iterate array and validate element
      const resultArr = data.map((x, index) =>
        validateHelper(x, schema[0], [data, ...ancestors], [index, ...keyPath])
      );
      const isValid = resultArr.every(x => x.isValid);
      return {
        isValid,
        result: resultArr,
      };
    }
    return {
      isValid: false,
      errors: [`Expected array but got ${dataType}.`],
      errorFactory: formFieldError,
    };
  } else if (typeof schema === 'object') {  // object
    if (dataType === 'object') {
      let resultObj = null;
      // If the special key, ANY_KEY, is present, use its value as schema to
      // validate all the values in the data.
      if (schema[ANY_KEY]) {
        resultObj = Object.keys(data).reduce((acc, key) => {
          acc[key] = validateHelper(data[key], schema[ANY_KEY], [data, ...ancestors], [key, ...keyPath]);
          return acc;
        }, {});
      } else {
        // iterate key and validate value
        resultObj = Object.keys(schema).reduce((acc, key) => {
          acc[key] = validateHelper(data[key], schema[key], [data, ...ancestors], [key, ...keyPath]);
          return acc;
        }, {});
      }
      const isValid = Object.keys(resultObj).every(key => resultObj[key].isValid);
      return {
        isValid,
        result: resultObj,
      };
    }
    return {
      isValid: false,
      errors: [`Expected object but got ${dataType}.`],
      errorFactory: formFieldError,
    };
  }
  throw new Error('validateHelper(): Not supposed to reach here.');
}

function compactResult(result) {
  if (result.isValid) {
    return null;
  } else if (result.result) {
    const subResult = result.result;
    if (Array.isArray(subResult)) {
      return subResult.map(compactResult);
    } else if (typeof subResult === 'object') {
      return Object.keys(subResult).reduce((acc, key) => {
        acc[key] = compactResult(subResult[key]);
        return acc;
      }, {});
    }
    throw new Error('compactResult(): Not supposed to reach here.');
  }
  return result.errorFactory(result.errors, result.data);
}

export function validate(data, schema) {
  const result = validateHelper(data, schema);
  const compactedResult = compactResult(result);
  return {
    isValid: result.isValid,
    errors: compactedResult,
  };
}
