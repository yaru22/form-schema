import chai from 'chai';

import { form, field, validate } from '../src/';

const should = chai.should();

const isNumber = n => (Number.isFinite(n) ?
    { isValid: true } : { isValid: false, error: 'not a number' });
const isString = s => (typeof s === 'string' ?
    { isValid: true } : { isValid: false, error: 'not a string' });
const isBoolean = b => (typeof b === 'boolean' ?
    { isValid: true } : { isValid: false, error: 'not a boolean' });
const isEven = n => (n % 2 === 0 ?
    { isValid: true } : { isValid: false, error: 'not an even number' });

describe('form-schema', () => {
  describe('primitives', () => {
    it('should validate a number', () => {
      const schema = field().validators(isNumber);
      const data = 5;
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });

    it('should fail to validate since it is a string', () => {
      const schema = field().validators(isNumber);
      const data = 'not-a-number';
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.reasons.should.have.length(1);
      errors.reasons[0].should.equal('not a number');
    });

    it('should validate an even number', () => {
      const schema = field().validators(isNumber, isEven);
      const data = 4;
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });

    it('should fail to validate since it is not an even number', () => {
      const schema = field().validators(isNumber, isEven);
      const data = 5;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.reasons.should.have.length(1);
      errors.reasons[0].should.equal('not an even number');
    });

    it('should fail to validate since it is a string', () => {
      const schema = field().validators(isNumber, isEven);
      const data = 'not-a-number';
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.reasons.should.have.length(2);
      errors.reasons[0].should.equal('not a number');
      errors.reasons[1].should.equal('not an even number');
    });

    it('should validate a string', () => {
      const schema = field().validators(isString);
      const data = 'test';
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });

    it('should fail to validate since it is not a string', () => {
      const schema = field().validators(isString);
      const data = 7;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.reasons.should.have.length(1);
      errors.reasons[0].should.equal('not a string');
    });

    it('should validate required field', () => {
      const schema = field().validators(isString).required();
      const data = 'hello';
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });

    it('should fail to validate due to missing required field', () => {
      const schema = field().validators(isString).required();
      const { isValid, errors } = validate(undefined, schema);
      isValid.should.be.false;
      errors.reasons.should.have.length(1);
      errors.reasons[0].should.equal('The field is required.');
    });

    it('should validate undefined field since it is not required', () => {
      const schema = field().validators(isString);
      const { isValid } = validate(undefined, schema);
      isValid.should.be.true;
    });
  });

  describe('complex data', () => {
    describe('array', () => {
      it('should validate an array of numbers', () => {
        const schema = [field().validators(isNumber)];
        const data = [1, 3, 2, 4, 0];
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });

      it('should fail to validate an array of numbers due to a string', () => {
        const schema = [field().validators(isNumber)];
        const data = [1, 3, 2, 'not-a-number', 4, 0];
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.should.have.length(data.length);
        errors[3].reasons.should.have.length(1);
        errors[3].reasons[0].should.equal('not a number');
      });

      it('should fail to validate since it is an object', () => {
        const schema = [field().validators(isNumber)];
        const data = { name: 'Brian' };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.reasons.should.have.length(1);
        errors.reasons[0].should.equal('Expected array but got object.');
      });

      it('should fail to validate due to required element missing', () => {
        const schema = [field().validators(isString).required()];
        const data = ['hello', 'world', undefined];
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.should.have.length(data.length);
        errors[2].reasons.should.have.length(1);
        errors[2].reasons[0].should.equal('The field is required.');
      });
    });

    describe('object', () => {
      it('should validate an object with multiple primitives', () => {
        const schema = {
          id: field().validators(isString),
          name: field().validators(isString),
          isMale: field().validators(isBoolean),
        };
        const data = {
          id: '123',
          name: 'Brian',
          isMale: true,
        };
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });

      it('should fail to validate an object due to an invalid field', () => {
        const schema = {
          id: field().validators(isString),
          name: field().validators(isString),
          isMale: field().validators(isBoolean),
        };
        const data = {
          id: '123',
          name: 'Brian',
          isMale: 'not-a-boolean',
        };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        should.equal(null, errors.id);
        should.equal(null, errors.name);
        errors.isMale.reasons.should.have.length(1);
        errors.isMale.reasons[0].should.equal('not a boolean');
      });

      it('should fail to validate since it is an array', () => {
        const schema = {
          id: field().validators(isString),
          name: field().validators(isString),
          isMale: field().validators(isBoolean),
        };
        const data = [{
          id: '123',
          name: 'Brian',
          isMale: 'not-a-boolean',
        }];
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.reasons.should.have.length(1);
        errors.reasons[0].should.equal('Expected object but got array.');
      });

      it('should fail to validate due to required key missing', () => {
        const schema = {
          id: field().validators(isString).required(),
          name: field().validators(isString).required(),
          isMale: field().validators(isBoolean).required(),
        };
        const data = {
          name: 'Brian',
          isMale: true,
        };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        should.equal(null, errors.name);
        should.equal(null, errors.isMale);
        errors.id.reasons.should.have.length(1);
        errors.id.reasons[0].should.equal('The field is required.');
      });
    });

    describe('object and array mixed', () => {
      it('should validate an array of objects', () => {
        const schema = [{
          id: field().validators(isString),
          name: field().validators(isString),
        }];
        const data = [
          {
            id: 'id1',
            name: 'Brian',
          },
          {
            id: 'id1',
            name: 'Caroline',
          },
        ];
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });

      it('should fail to validate an array of objects due to mismatching elements', () => {
        const schema = [{
          id: field().validators(isString),
          name: field().validators(isString),
        }];
        const data = [
          {
            id: 'id1',
            name: 'Brian',
          },
          'hello',  // error
          {
            id: 'id1',
            name: 33,  // error
          },
        ];
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.should.have.length(data.length);
        errors[1].reasons[0].should.equal('Expected object but got string.');
        errors[2].name.reasons.should.have.length(1);
        errors[2].name.reasons[0].should.equal('not a string');
      });

      it('should validate an object with arrays', () => {
        const schema = {
          id: field().validators(isString).required(),
          name: field().validators(isString).required(),
          biweekly: field().validators(isBoolean),
          data: [field().validators(isNumber).required()],
        };
        const data = {
          id: 'id1',
          name: 'ABC',
          biweekly: false,
          data: [0, 1, 1, 1, 1, 1, 0],
        };
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });

      it('should fail to validate an object with missing required field', () => {
        const schema = {
          id: field().validators(isString).required(),
          name: field().validators(isString).required(),
          biweekly: field().validators(isBoolean),
          data: [field().validators(isNumber).required()],
        };
        const data = {
          name: 'ABC',
          biweekly: false,
          data: [0, 1, 1, 1, 1, 1, 0],
        };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        should.equal(null, errors.name);
        should.equal(null, errors.biweekly);
        should.equal(null, errors.data);
        errors.id.reasons.should.have.length(1);
        errors.id.reasons[0].should.equal('The field is required.');
      });
    });

    describe('optional and/or nested form', () => {
      it('should validate undefined/null if the form is not required', () => {
        const schema = form({
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
        });
        let { isValid } = validate(null, schema);
        isValid.should.be.true;
        ({ isValid } = validate(undefined, schema));
        isValid.should.be.true;
      });

      it('should validate undefined/null if the nested form is not required', () => {
        const schema = {
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
          address: form({
            line1: field().validators(isString).required(),
            line2: field().validators(isString),
            locality: field().validators(isString).required(),
            region: field().validators(isString).required(),
            postalCode: field().validators(isString).required(),
            country: field().validators(isString).required(),
          }),
        };
        const dataNull = {
          name: 'Brian',
          age: 29,
          address: null,
        };
        let { isValid } = validate(dataNull, schema);
        isValid.should.be.true;
        const dataUndefined = {
          name: 'Brian',
          age: 29,
          address: undefined,
        };
        ({ isValid } = validate(dataUndefined, schema));
        isValid.should.be.true;
      });

      it('should not validate if the required nested form is null', () => {
        const schema = {
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
          address: form({
            line1: field().validators(isString).required(),
            line2: field().validators(isString),
            locality: field().validators(isString).required(),
            region: field().validators(isString).required(),
            postalCode: field().validators(isString).required(),
            country: field().validators(isString).required(),
          }).required(),
        };
        const data = {
          name: 'Brian',
          age: 29,
          address: null,
        };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        should.equal(null, errors.name);
        should.equal(null, errors.age);
        errors.address.reasons.should.have.length(1);
        errors.address.reasons[0].should.equal('The form is required.');
      });

      it('should validate if the required nested form is valid', () => {
        const schema = {
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
          address: form({
            line1: field().validators(isString).required(),
            line2: field().validators(isString),
            locality: field().validators(isString).required(),
            region: field().validators(isString).required(),
            postalCode: field().validators(isString).required(),
            country: field().validators(isString).required(),
          }).required(),
        };
        const data = {
          name: 'Brian',
          age: 29,
          address: {
            line1: '123 Test St.',
            line2: 'Unit #903',
            locality: 'North York',
            region: 'Toronto',
            postalCode: 'A1B2C3',
            country: 'Canada',
          },
        };
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });

      it('should not validate if the required nested form is invalid', () => {
        const schema = {
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
          address: form({
            line1: field().validators(isString).required(),
            line2: field().validators(isString),
            locality: field().validators(isString).required(),
            region: field().validators(isString).required(),
            postalCode: field().validators(isString).required(),
            country: field().validators(isString).required(),
          }).required(),
        };
        const data = {
          name: 'Brian',
          age: 29,
          address: {
            line1: null,
            line2: null,
            locality: 'North York',
            region: 'Toronto',
            postalCode: 12345,
            country: 'Canada',
          },
        };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        should.equal(null, errors.name);
        should.equal(null, errors.age);
        errors.address.line1.reasons.should.have.length(1);
        errors.address.line1.reasons[0].should.equal('The field is required.');
        should.equal(null, errors.address.line2);
        should.equal(null, errors.address.locality);
        should.equal(null, errors.address.region);
        errors.address.postalCode.reasons.should.have.length(1);
        errors.address.postalCode.reasons[0].should.equal('not a string');
      });
    });
  });

  describe('function schema', () => {
    it('should work even if a function that returns a schema is given in lieu of schema object', () => {
      const schema = () => {
        return {
          name: field().validators(isString).required(),
          age: field().validators(isNumber),
          address: form({
            line1: field().validators(isString).required(),
            line2: field().validators(isString),
            locality: field().validators(isString).required(),
            region: field().validators(isString).required(),
            postalCode: field().validators(isString).required(),
            country: field().validators(isString).required(),
          }).required(),
        };
      };
      const data = {
        name: 'Brian',
        age: 29,
        address: {
          line1: '123 Test St.',
          line2: 'Unit #903',
          locality: 'North York',
          region: 'Toronto',
          postalCode: 'A1B2C3',
          country: 'Canada',
        },
      };
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });
  });

  describe('validators', () => {
    it('should run without any exception if no validators are given', () => {
      const data = {
        name: 'Brian',
      };
      const schema = {
        name: field(),
      };
      should.not.Throw(() => {
        const { isValid } = validate(data, schema);
        isValid.should.be.true;
      });
    });

    it('should supply the field data, its ancestors and the keyPath to the validator', () => {
      const data = {
        id: 'id1',
        name: 'ABC',
        nested: {
          random: '123',
        },
        arr: [3, 4, 5],
      };
      const rootFieldsValidator = (fieldData, ancestors, keyPath) => {
        ancestors.should.have.length(1);
        ancestors[0].should.equal(data);
        keyPath.should.have.length(1);
        (keyPath[0] === 'id' || keyPath[0] === 'name').should.be.true;
        return {
          isValid: true,
        };
      };
      const nestedFieldValidator = (fieldData, ancestors, keyPath) => {
        ancestors.should.have.length(2);
        ancestors[0].should.equal(data.nested);
        ancestors[1].should.equal(data);
        keyPath.should.have.length(2);
        keyPath[0].should.equal('random');
        keyPath[1].should.equal('nested');
        return {
          isValid: true,
        };
      };
      const arrFieldValidator = (fieldData, ancestors, keyPath) => {
        ancestors.should.have.length(2);
        ancestors[0].should.equal(data.arr);
        ancestors[1].should.equal(data);
        keyPath.should.have.length(2);
        (keyPath[0] >= 0 && keyPath[0] <= 2).should.be.true;
        keyPath[1].should.equal('arr');
        return {
          isValid: true,
        };
      };
      const schema = {
        id: field().validators(rootFieldsValidator).required(),
        name: field().validators(rootFieldsValidator).required(),
        nested: {
          random: field().validators(nestedFieldValidator),
        },
        arr: [field().validators(arrFieldValidator)],
      };
      const { isValid } = validate(data, schema);
      isValid.should.be.true;
    });
  });

  describe('attributes', () => {
    it('should be able to get attributes it supplied to the constructor', () => {
      const attrs = {
        type: 'email',
        label: 'Email',
        placeholder: 'Email',
      };
      const schema = {
        email: field(attrs).validators(isString).required(),
      };
      schema.email.getAttributes().should.eql(attrs);
    });
  });
});
