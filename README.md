infuse.js
=========

javascript ioc library based on property name

## create injector

	var injector = new infuse.Injector();

## map value

	injector.mapValue("name", "John");

## inject value

	var Person = function() {
		this.name = null;
	}
	var john = new Person();
	injector.inject(john);
	alert(john.name); // will alert john

or

	var Person = function() {
		this.name = null;
	}
	var john = injector.createInstance(Person);
	alert(john.name); // will alert john


