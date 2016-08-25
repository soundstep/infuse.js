var infuse = require('../src/infuse');

var injector = new infuse.Injector();

injector.mapValue('name', 'John');
injector.mapValue('age', 21);

// es5 function
function ModelES5(name) {
    console.log('ES5 dependencies');
    console.log('    - name:', name);
    this.age = null;
    this.postConstruct = function() {
        console.log('    - age:', this.age);
    }
}

// es6 arrow function
var ModelES6Arrow = (name) => {

};

// es6 class
class ModelES6Class {
    constructor(name) {
        console.log('ES6 class dependencies');
        console.log('    - name:', name);
        this.age = null;
    }
    postConstruct() {
        console.log('    - age:', this.age);
    }
}

injector.createInstance(ModelES5);
try {
    injector.createInstance(ModelES6Arrow);
} catch(err) {
    console.log(err.message);
}
injector.createInstance(ModelES6Class);
