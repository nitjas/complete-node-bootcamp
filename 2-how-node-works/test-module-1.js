// ES 6 syntax of writing classes in JS
class Calculator {
  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    return a / b;
  }
}

module.exports = Calculator; // export one single value, the Calculator class
// this is exactly what is returned from this module
// this name is irrelevant on the other/importing side
