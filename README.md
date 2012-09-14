infuse.js
=========

javascript ioc library

## installation

Just grab the script (infuse.js) from the repo for a normal use.

Or install it with npm for node.js:

	npm install infuse.js

## create injector

	var injector = new infuse.Injector();

## create injector with node.js

	var infuse = require(“infuse.js”);
	var injector = new infuse.Injector();

## map value

	injector.mapValue("name", "John");

## remove mapping

	injector.removeMapping("name");

## test mapping

	injector.hasMapping("name");

## inject value

	injector.inject(john);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map value to the name property
	injector.mapValue("name", "John");
	// create person class
	var Person = function() {
		this.name = null;
	}
	// instantiate Person class
	var john = new Person();
	// inject values in the Person instance
	injector.inject(john);
	alert(john.name); // will alert john

or

	var john = injector.createInstance(Person);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map value to the name property
	injector.mapValue("name", "John");
	// create person class
	var Person = function() {
		this.name = null;
	}
	// instantiate Person class and inject values
	var john = injector.createInstance(Person);
	alert(john.name); // will alert john

Full example with constructor:

	// create injector
	var injector = new infuse.Injector();
	// map value to the name property
	injector.mapValue("name", "John");
	// create person class
	var Person = function(name) {
		this.nameParam = name;
	}
	// instantiate Person class and inject values from the constructor
	var john = injector.createInstance(Person);
	alert(john.nameParam); // will alert john

## map class

	injector.mapClass("model", MyModel);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel);
	// create class that will receive an instance of MyModel class
	var OtherClass = function() {
		this.model = null;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.model); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.model); // contains another MyModel instance

Full example with constructor:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel);
	// create class that will receive an instance of MyModel class
	var OtherClass = function(model) {
		this.modelParam = model;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.modelParam); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.modelParam); // contains another MyModel instance

## map class as singleton

	injector.mapClass("model", MyModel, true);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel, true);
	// create class that will receive an instance of MyModel class
	var OtherClass = function() {
		this.model = null;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.model); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.model); // contains the same model instance as other1

Full example with constructor:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel, true);
	// create class that will receive an instance of MyModel class
	var OtherClass = function(model) {
		this.modelParam = model;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.modelParam); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.modelParam); // contains the same model instance as other1

## get instance

	var model = injector.getInstance(MyModel);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel);
	// get instance created
	var model1 = injector.getInstance(MyModel);
	alert(model1); // contains a MyModel instance
	var model2 = injector.getInstance(MyModel);
	alert(model2); // contains another MyModel instance

## get instance as singleton

	var model = injector.getInstance(MyModel);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// map class to the model property
	injector.mapClass("model", MyModel, true);
	// get instance created
	var model1 = injector.getInstance(MyModel);
	alert(model1); // contains a MyModel instance
	var model2 = injector.getInstance(MyModel);
	alert(model2); // model2 is identical to model1

## create child injector (inherit the mapping from the parent injector)

	var child = injector.createChild();

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map value to the name property on the parent injector
	injector.mapValue("name", "John");
	// create child injector
	var child = injector.createChild();
	// map value to the type property on the child injector
	child.mapValue("type", "male");
	// create class that will receive the name and type value
	var FooClass = function() {
		this.name = null;
		this.type = null;
	}
	// instance the class with the child injector
	var fooChild = child.createInstance(FooClass);
	alert(fooChild.name); // will alert "John"
	alert(fooChild.type); // will alert "male"
	var fooParent = injector.createInstance(FooClass);
	alert(fooParent.name); // will alert "John"
	alert(fooParent.type); // will alert null

## getInstance vs createInstance

The method createInstance will always return a new instance.

The method getInstance needs to have a mapping registered and might return the same instance depending if the class has been mapped as singleton.

	// return a new instance every time
	var instance1 = injector.createInstance(MyClass);
	var instance2 = injector.createInstance(MyClass);
	var instance3 = injector.createInstance(MyClass);

	// return a new instance every time
	injector.mapClass("name", MyClass);
	var instance1 = injector.getInstance(MyClass);
	var instance2 = injector.getInstance(MyClass);
	var instance3 = injector.getInstance(MyClass);

	// return the same instance every time
	injector.mapClass("name", MyClass, true); // mapped as singleton
	var instance1 = injector.getInstance(MyClass);
	var instance2 = injector.getInstance(MyClass);
	var instance3 = injector.getInstance(MyClass);

## post construct

A post construct method can be added, it will be automatically called once the injection is done.

	// create injector
	var injector = new infuse.Injector();
	// map value to the data property
	injector.mapValue("data", "some data");
	// create model class
	var MyModel = function() {
		this.data = null;
	}
	MyModel.prototype = {
		postConstruct: function() {
			// called after injection
			// this.data is injected
			alert(this.data);
		}
	}
	injector.createInstance(MyModel);

## License

	Copyright (c) | 2012 | infuse.js | Romuald Quantin | www.soundstep.com

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
	modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
	IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	