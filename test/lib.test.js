import chai from 'chai';

import validate, { field } from '../src/';

chai.should();

const isNumber = n => (Number.isFinite(n) ?
    { isValid: true } : { isValid: false, error: 'not a number' });
const isString = s => (typeof s === 'string' ?
    { isValid: true } : { isValid: false, error: 'not a string' });
const isBoolean = b => (typeof b === 'boolean' ?
    { isValid: true } : { isValid: false, error: 'not a boolean' });
const isEven = n => (n % 2 === 0 ?
    { isValid: true } : { isValid: false, error: 'not an even number' });

describe('form-shape', () => {
  describe('primitives', () => {
    it('should validate a number', () => {
      const schema = field(isNumber);
      const data = 5;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.true;
      errors.should.be.empty;
    });

    it('should fail to validate since it is a string', () => {
      const schema = field(isNumber);
      const data = 'not-a-number';
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.should.have.length(1);
      errors[0].should.equal('not a number');
    });

    it('should validate an even number', () => {
      const schema = field(isNumber, isEven);
      const data = 4;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.true;
      errors.should.be.empty;
    });

    it('should fail to validate since it is not an even number', () => {
      const schema = field(isNumber, isEven);
      const data = 5;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.should.have.length(1);
      errors[0].should.equal('not an even number');
    });

    it('should fail to validate since it is a string', () => {
      const schema = field(isNumber, isEven);
      const data = 'not-a-number';
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.should.have.length(2);
      errors[0].should.equal('not a number');
      errors[1].should.equal('not an even number');
    });

    it('should validate a string', () => {
      const schema = field(isString);
      const data = 'test';
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.true;
      errors.should.be.empty;
    });

    it('should fail to validate since it is not a string', () => {
      const schema = field(isString);
      const data = 7;
      const { isValid, errors } = validate(data, schema);
      isValid.should.be.false;
      errors.should.have.length(1);
      errors[0].should.equal('not a string');
    });
  });

  describe('complex data', () => {
    describe('array', () => {
      it('should validate an array of numbers', () => {
        const schema = [field(isNumber)];
        const data = [1, 3, 2, 4, 0];
        const result = validate(data, schema);
        result.should.have.length(data.length);
        result.forEach(x => {
          x.isValid.should.be.true;
          x.errors.should.be.empty;
        });
      });

      it('should fail to validate an array of numbers due to a string', () => {
        const schema = [field(isNumber)];
        const data = [1, 3, 2, 'not-a-number', 4, 0];
        const result = validate(data, schema);
        result.should.have.length(data.length);
        result[3].isValid.should.be.false;
        result[3].errors.should.have.length(1);
        result[3].errors[0].should.equal('not a number');
      });

      it('should fail to validate since it is an object', () => {
        const schema = [field(isNumber)];
        const data = { name: 'Brian' };
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.should.have.length(1);
        errors[0].should.equal('Expected an array but got a object.');
      });
    });

    describe('object', () => {
      it('should validate an object with multiple primitives', () => {
        const schema = {
          id: field(isString),
          name: field(isString),
          isMale: field(isBoolean),
        };
        const data = {
          id: '123',
          name: 'Brian',
          isMale: true,
        };
        const result = validate(data, schema);
        result.id.isValid.should.be.true;
        result.id.errors.should.be.empty;
        result.name.isValid.should.be.true;
        result.name.errors.should.be.empty;
        result.isMale.isValid.should.be.true;
        result.isMale.errors.should.be.empty;
      });

      it('should fail to validate an object due to an invalid field', () => {
        const schema = {
          id: field(isString),
          name: field(isString),
          isMale: field(isBoolean),
        };
        const data = {
          id: '123',
          name: 'Brian',
          isMale: 'not-a-boolean',
        };
        const result = validate(data, schema);
        result.id.isValid.should.be.true;
        result.id.errors.should.be.empty;
        result.name.isValid.should.be.true;
        result.name.errors.should.be.empty;
        result.isMale.isValid.should.be.false;
        result.isMale.errors.should.have.length(1);
        result.isMale.errors[0].should.equal('not a boolean');
      });

      it('should fail to validate since it is an array', () => {
        const schema = {
          id: field(isString),
          name: field(isString),
          isMale: field(isBoolean),
        };
        const data = [{
          id: '123',
          name: 'Brian',
          isMale: 'not-a-boolean',
        }];
        const { isValid, errors } = validate(data, schema);
        isValid.should.be.false;
        errors.should.have.length(1);
        errors[0].should.equal('Expected an object but got a array.');
      });
    });

    describe('object and array mixed', () => {
      it('should validate an array of objects', () => {
      });

      it('should validate an object with arrays', () => {
      });
    });
  });
});

// const data = {
//   id: 'id1',
//   name: 'ABC',
//   biweekly: false,
//   data: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
// };

// const nv = () => ({ isValid: false, error: 'hello' });

// const schema = {
//   id: field(nv),
//   name: field(nv),
//   biweekly: field(nv),
//   data: [field(nv)],
// };
