import chai from 'chai';

import formShape from '../src/';

chai.should();

describe('form-shape', () => {
  it('should pass', () => {
    formShape.a.should.equal(3);
  });
});
