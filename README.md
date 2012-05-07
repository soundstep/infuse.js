infuse.js
=========

javascript ioc library based on property name

## create injector

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

## map class

	injector.mapClass("model", MyModel);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map class to the model property
	injector.mapClass("model", MyModel);
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// create class that will receive an instance of MyModel class
	var OtherClass = function() {
		this.model = null;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.model); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.model); // contains another MyModel instance

## map class as singleton

	injector.mapClass("model", MyModel, true);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map class to the model property
	injector.mapClass("model", MyModel, true);
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// create class that will receive an instance of MyModel class
	var OtherClass = function() {
		this.model = null;
	}
	// instantiate Person class and inject values
	var other1 = injector.createInstance(OtherClass);
	alert(other1.model); // contains a MyModel instance
	var other2 = injector.createInstance(OtherClass);
	alert(other2.model); // contains the same model instance as other1

## get instance

	var model = injector.getInstance(MyModel);

Full example:

	// create injector
	var injector = new infuse.Injector();
	// map class to the model property
	injector.mapClass("model", MyModel);
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
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
	// map class to the model property
	injector.mapClass("model", MyModel, true);
	// create model class
	var MyModel = function() {
		this.data = "data";
	}
	// get instance created
	var model1 = injector.getInstance(MyModel);
	alert(model1); // contains a MyModel instance
	var model2 = injector.getInstance(MyModel);
	alert(model2); // model2 is identical to model1

## getInstance vs createInstance

The method createInstance will always return a new instance.
The method getInstance needs to have a mapping registered and might return the same instance depending if the class has been mapped has singleton.

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
	injector.mapClass("name", MyClass, true);
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

