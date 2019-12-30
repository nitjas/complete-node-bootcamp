// more elegant than in test-module-1
// assign class directly to module.exports
// with a class expression
// this is a class.. assign it to a variable.. now this is an expression
module.exports = class {
  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    return a / b;
  }
};
