infuse.js
=========

javascript ioc library based on property name

## create injector

	var injector = new infuse.Injector();

## map value

	injector.mapValue("name", "John");

## inject value

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

	// create injector
	var injector = new infuse.Injector();
	// map value to the name property
	injector.mapValue("name", "John");
	// create person class
	var Person = function() {
		this.name = null;
	}
	// instantiate Person class and inject properties
	var john = injector.createInstance(Person);
	alert(john.name); // will alert john


