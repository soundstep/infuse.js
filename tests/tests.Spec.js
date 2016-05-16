if (typeof require !== 'undefined') {
	var infuse = require('../src/infuse');
}

var utils = {};

utils.applyProperties = function(target, extension) {
	for (var prop in extension) {
		target[prop] = extension[prop];
	}
};

utils.inherit = function(target, obj) {
	var subclass;
	if (obj && obj.hasOwnProperty('constructor')) {
		// use constructor if defined
		subclass = obj.constructor;
	} else {
		// call the super constructor
		subclass = function(){
			return target.apply(this, arguments);
		};
	}
	// add super properties
	utils.applyProperties(subclass.prototype, target.prototype);
	// set the prototype chain to inherit from the parent without calling parent's constructor
	var chain = function(){};
	chain.prototype = target.prototype;
	subclass.prototype = new chain();
	// add obj properties
	if (obj) utils.applyProperties(subclass.prototype, obj, target.prototype);
	// point constructor to the subclass
	subclass.prototype.constructor = subclass;
	// set super class reference
	subclass.parent = target.prototype;
	return subclass;
};

utils.getGlobal = function() {
	return (typeof process === "undefined" ? window : global);
}


describe("infuse.js", function () {

	var injector;

	beforeEach(function () {
		injector = new infuse.Injector();
	});

	afterEach(function () {
		injector.dispose();
		injector = null;
	});

	it("create injector", function () {
		expect(injector).not.toBeNull();
		expect(injector).not.toBeUndefined();
		expect(injector instanceof infuse.Injector).toBeTruthy();
	});

	it("create 2 injectors", function () {
		var inj1 = new infuse.Injector();
		var inj2 = new infuse.Injector();
		inj1.mapValue("name", "John");
		expect(inj2.hasMapping("name")).toBeFalsy();
	});

	it("has mapping value", function () {
		injector.mapValue("name", "John");
		expect(injector.hasMapping("name")).toBeTruthy();
	});

	it("has mapping class", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass);
		expect(injector.hasMapping("name")).toBeTruthy();
	});

	it("map class singleton twice with getValue", function () {
		var InstanceClass = function(){};
		injector.mapClass("name1", InstanceClass, true);
		injector.mapClass("name2", InstanceClass, true);
		var instance1 = injector.getValue("name1");
		var instance2 = injector.getValue("name2");
		expect(instance1 !== instance2).toBeTruthy();
	});

	it("map class singleton twice with injection", function () {
		var InstanceClass = function(){};
		injector.mapClass("name1", InstanceClass, true);
		injector.mapClass("name2", InstanceClass, true);
		var TestClass1 = function(){this.name1 = null;};
		var TestClass2 = function(){this.name2 = null;};
		var instance1 = injector.createInstance(TestClass1);
		var instance2 = injector.createInstance(TestClass2);
		expect(instance1 !== instance2).toBeTruthy();

	});

	it("mapping value bad property throws error", function () {
		expect(function(){injector.mapValue(1, 1)}).toThrow(infuse.errors.MAPPING_BAD_PROP);
	});

	it("mapping value bad value throws error", function () {
		expect(function(){injector.mapValue("name")}).toThrow(infuse.errors.MAPPING_BAD_VALUE + "name");
	});

	it("mapping class no class throws error", function () {
		expect(function(){injector.mapClass("name")}).toThrow(infuse.errors.MAPPING_BAD_CLASS + "name");
	});

	it("mapping class wrong class throws error with non-class", function () {
		expect(function(){injector.mapClass("name", 1)}).toThrow(infuse.errors.MAPPING_BAD_CLASS + "name");
	});

	it("already has mapping value throws error", function () {
		injector.mapValue("name", "John");
		expect(function(){injector.mapValue("name", "John")}).toThrow(infuse.errors.MAPPING_ALREADY_EXISTS + "name");
	});

	it("already has mapping class throws error", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass);
		expect(function(){injector.mapClass("name", InstanceClass)}).toThrow(infuse.errors.MAPPING_ALREADY_EXISTS + "name");
	});

	it("remove mapping with no mapping", function () {
		injector.removeMapping("name");
		expect(injector.hasMapping("name")).toBeFalsy();
	});

	it("remove mapping value", function () {
		injector.mapValue("name", "John").removeMapping("name");
		expect(injector.hasMapping("name")).toBeFalsy();
	});

	it("remove mapping class", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass).removeMapping("name");
		expect(injector.hasMapping("name")).toBeFalsy();
	});

	it("re-mapping value after removal", function () {
		injector.mapValue("name", "John").removeMapping("name").mapValue("name", "John");
		expect(injector.hasMapping("name")).toBeTruthy();
	});

	it("re-mapping class after removal", function () {
		var InstanceClass = function(){};
		injector.mapValue("name", InstanceClass).removeMapping("name").mapValue("name", InstanceClass);
		expect(injector.hasMapping("name")).toBeTruthy();
	});

	it("get mapping value", function () {
		injector.mapValue("name", "John");
		expect(injector.getMapping("John")).toEqual("name");
	});

	it("get mapping class", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass);
		expect(injector.getMapping(InstanceClass)).toEqual("name");
	});

	it("get non-existing mapping returns undefined", function () {
		expect(injector.getMapping("John")).toBeUndefined();
	});

	it("get value", function () {
		injector.mapValue("name", "John");
		expect(injector.getValue("name")).toEqual("John");
	});

	it("get value boolean", function () {
		injector.mapValue("bool1", true);
		injector.mapValue("bool2", false);
		expect(injector.getValue("bool1")).toEqual(true);
		expect(injector.getValue("bool2")).toEqual(false);
	});

	it("get value empty string", function () {
		injector.mapValue("name", "");
		expect(injector.getValue("name")).toEqual('');
	});

	it("get value no mapping throws error", function () {
		expect(function(){injector.getValue("name")}).toThrow(infuse.errors.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name", undefined)}).toThrow(infuse.errors.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name", null)}).toThrow(infuse.errors.NO_MAPPING_FOUND);
	});

	it("get class", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass);
		expect(injector.getClass("name")).toEqual(InstanceClass);
	});

//	it("get non-existing mapping value returns undefined", function () {
//		expect(injector.getValue("name")).toBeUndefined();
//	});
//
	it("inject property into object", function () {
		var foo = {name: null};
		injector.mapValue("name", "John").inject(foo);
		expect(foo.name).toEqual("John");
	});

	it("inject function into object", function () {
		var foo = {getName: null};
		var func = function(){return "John"};
		injector.mapValue("getName", func).inject(foo);
		expect(foo.getName).toEqual(func);
		expect(foo.getName()).toEqual("John");
	});

	it("inject instance into object", function () {
		var foo = {instance: null};
		var InstanceClass = function(){};
		var instance = new InstanceClass();
		injector.mapValue("instance", instance).inject(foo);
		expect(foo.instance).toEqual(instance);
	});

	it("inject class into object", function () {
		var foo = {instance: null};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass).inject(foo);
		expect(foo.instance instanceof InstanceClass).toBeTruthy();
	});

	it("inject class not singleton into object", function () {
		var foo1 = {instance: null};
		var foo2 = {instance: null};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass);
		injector.inject(foo1);
		injector.inject(foo2);
		expect(foo1.instance instanceof InstanceClass).toBeTruthy();
		expect(foo2.instance instanceof InstanceClass).toBeTruthy();
		expect(foo1.instance === foo2.instance).toBeFalsy();
	});

	it("inject class singleton into object", function () {
		var foo1 = {instance: null};
		var foo2 = {instance: null};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass, true);
		injector.inject(foo1);
		injector.inject(foo2);
		expect(foo1.instance instanceof InstanceClass).toBeTruthy();
		expect(foo2.instance instanceof InstanceClass).toBeTruthy();
		expect(foo1.instance === foo2.instance).toBeTruthy();
	});

	it("inject property into instance", function () {
		var FooClass = function(){this.name=null;};
		var foo = new FooClass();
		injector.mapValue("name", "John").inject(foo);
		expect(foo.name).toEqual("John");
	});

	it("inject function into instance", function () {
		var FooClass = function(){this.getName=null};
		var foo = new FooClass();
		var func = function(){return "John"};
		injector.mapValue("getName", func).inject(foo);
		expect(foo.getName).toEqual(func);
		expect(foo.getName()).toEqual("John");
	});

	it("inject instance into instance", function () {
		var FooClass = function(){this.instance=null};
		var foo = new FooClass();
		var InstanceClass = function(){};
		var instance = new InstanceClass();
		injector.mapValue("instance", instance).inject(foo);
		expect(foo.instance).toEqual(instance);
	});

	it("inject class not singleton into instance", function () {
		var FooClass1 = function(){this.instance=null};
		var FooClass2 = function(){this.instance=null};
		var foo1 = new FooClass1();
		var foo2 = new FooClass2();
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass);
		injector.inject(foo1);
		injector.inject(foo2);
		expect(foo1.instance instanceof InstanceClass).toBeTruthy();
		expect(foo2.instance instanceof InstanceClass).toBeTruthy();
		expect(foo1.instance === foo2.instance).toBeFalsy();
	});

	it("inject class singleton into instance", function () {
		var FooClass1 = function(){this.instance=null};
		var FooClass2 = function(){this.instance=null};
		var foo1 = new FooClass1();
		var foo2 = new FooClass2();
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass, true);
		injector.inject(foo1);
		injector.inject(foo2);
		expect(foo1.instance instanceof InstanceClass).toBeTruthy();
		expect(foo2.instance instanceof InstanceClass).toBeTruthy();
		expect(foo1.instance === foo2.instance).toBeTruthy();
	});

	it("inject class with constructor not singleton into instance", function () {
		var FooClass1 = function(instance){this.instanceParam=instance};
		var FooClass2 = function(instance){this.instanceParam=instance};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass);
		var foo1 = injector.createInstance(FooClass1);
		var foo2 = injector.createInstance(FooClass2);
		expect(foo1.instanceParam instanceof InstanceClass).toBeTruthy();
		expect(foo2.instanceParam instanceof InstanceClass).toBeTruthy();
		expect(foo1.instanceParam === foo2.instanceParam).toBeFalsy();
	});

	it("inject class with constructor singleton into instance", function () {
		var FooClass1 = function(instance){this.instanceParam=instance};
		var FooClass2 = function(instance){this.instanceParam=instance};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass, true);
		var foo1 = injector.createInstance(FooClass1);
		var foo2 = injector.createInstance(FooClass2);
		expect(foo1.instanceParam instanceof InstanceClass).toBeTruthy();
		expect(foo2.instanceParam instanceof InstanceClass).toBeTruthy();
		expect(foo1.instanceParam === foo2.instanceParam).toBeTruthy();
	});

	it("inject class with constructor in itself throws error with getValue", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass, true);
		expect(function(){injector.getValue("name")}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("inject class with constructor in itself throws error with getValueFromClass", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("inject class in itself throws error with getValue", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValue("name")}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("inject class in itself throws error with getValueFromClass", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("injected in prototype (property)", function () {
		var FooClass = function(){};
		FooClass.prototype.name = null;
		injector.mapValue("name", 'John');
		var foo = injector.createInstance(FooClass);
		expect(foo.name).toEqual('John');
	});

	it("injected in prototype (property) with inheritance", function () {
		var Human = function(){};
		Human.prototype.name = null;
		var Male = function(){};
		utils.inherit(Human, Male.prototype);
		injector.mapValue("name", "John");
		var male = injector.createInstance(Male);
		expect(male.name).toEqual('John');
	});

	it("create instance", function () {
		var FooClass = function(){};
		var foo = injector.createInstance(FooClass);
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("create instance with params", function () {
		var FooClass = function(p1, p2, p3){
			this.p1 = p1;
			this.p2 = p2;
			this.p3 = p3;
		};
		var foo = injector.createInstance(FooClass, 1, false, '');
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.p1).toEqual(1);
		expect(foo.p2).toEqual(false);
		expect(foo.p3).toEqual('');
	});

	it("create instance no param throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.createInstance()}).toThrow(infuse.errors.CREATE_INSTANCE_INVALID_PARAM);
	});

	it("create instance invalid param throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.createInstance(1)}).toThrow(infuse.errors.CREATE_INSTANCE_INVALID_PARAM);
	});

	it("create instance inject property", function () {
		var FooClass = function(){this.name=null;};
		var foo = injector.mapValue("name", "John").createInstance(FooClass);
		expect(foo.name).toEqual("John");
	});

	it("create instance inject function", function () {
		var FooClass = function(){this.getName=null;};
		var func = function(){return "John"};
		var foo = injector.mapValue("getName", func).createInstance(FooClass);
		expect(foo.getName).toEqual(func);
	});

	it("create instance inject instance", function () {
		var FooClass = function(){this.instance=null;};
		var InstanceClass = function(){};
		var instance = new InstanceClass();
		var foo = injector.mapValue("instance", instance).createInstance(FooClass);
		expect(foo.instance).toEqual(instance);
	});

	it("create instance unique", function () {
		var FooClass1 = function(){this.name=null;};
		var FooClass2 = function(){};
		var foo1 = injector.createInstance(FooClass1);
		var foo2 = injector.createInstance(FooClass2);
		expect(foo1).not.toEqual(foo2);
	});

	it("create instance with arguments", function () {
		var FooClass = function(name){this.name=name;this.age=null;};
		var foo = injector.mapValue("age", 21).createInstance(FooClass, "John");
		expect(foo.name).toEqual("John");
		expect(foo.age).toEqual(21);
	});

	it("create instance with constructor mapping", function () {
		var p1 = "John";
		var p2 = 31;
		var p3 = {data:"data"};
		var p4 = [1, "string", true];
		var p5 = true;
		injector.mapValue("p1", p1);
		injector.mapValue("p2", p2);
		injector.mapValue("p3", p3);
		injector.mapValue("p4", p4);
		injector.mapValue("p5", p5);
		var FooClass = function(p1, p2, p3, p4, p5){
			this.param1 = p1;
			this.param2 = p2;
			this.param3 = p3;
			this.param4 = p4;
			this.param5 = p5;
		};
		var foo = injector.createInstance(FooClass);
		expect(foo.param1).toEqual(p1);
		expect(foo.param2).toEqual(p2);
		expect(foo.param3).toEqual(p3);
		expect(foo.param4).toEqual(p4);
		expect(foo.param5).toEqual(p5);
	});

	it("create instance with constructor forced parameters", function () {
		var p1 = "John";
		var p2 = 31;
		var p3 = {data:"data"};
		injector.mapValue("p1", p1);
		injector.mapValue("p2", p2);
		injector.mapValue("p3", p3);
		var FooClass = function(p1, p2, p3){
			this.param1 = p1;
			this.param2 = p2;
			this.param3 = p3;
		};
		var foo = injector.createInstance(FooClass, null, "forced", undefined);
		expect(foo.param1).toEqual(p1);
		expect(foo.param2).toEqual("forced");
		expect(foo.param3).toEqual(p3);
	});

	it("create instance with constructor mapping and inheritance", function () {
		var Human = function(type) {
			this.typeParam = type
		}
		Human.prototype.getType = function() {
			return this.typeParam;
		}
		var Male = function(name) {
			Human.call(this, "male")
			this.nameParam = name;
		}
		Male.prototype.getName = function() {
			return this.nameParam;
		}
		utils.inherit(Human, Male.prototype);
		injector.mapValue("name", "John");
		var male = injector.createInstance(Male);
		expect(male.typeParam).toEqual("male");
		expect(male.nameParam).toEqual("John");
		expect(male.getType()).toEqual("male");
		expect(male.getName()).toEqual("John");
	});

	it("get instance with getValue", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo = injector.getValue("name");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("get instance with getValueFromClass", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo = injector.getValueFromClass(FooClass);
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("get instance no mapping throws error", function () {
		var FooClass = function(){this.name=null;};
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.errors.NO_MAPPING_FOUND);
	});

	it("get instance bad singleton parameter throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.mapClass("name", FooClass, "bad")}).toThrow(infuse.errors.MAPPING_BAD_SINGLETON + "name");
	});

	it("get instance with constructor mapping with getValue", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		injector.mapValue("type", "type");
		var foo = injector.getValue("name");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("type");
	});

	it("get instance with constructor mapping with getValueFromClass", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		injector.mapValue("type", "type");
		var foo = injector.getValueFromClass(FooClass);
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("type");
	});

	it("get instance with constructor parameters with getValue", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		var foo = injector.getValue("name", "type");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("type");
	});

	it("get instance with constructor parameters with getValueFromClass", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		var foo = injector.getValueFromClass(FooClass, "type");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("type");
	});

	it("get instance with constructor forced parameters with getValue", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		injector.mapValue("type", "type");
		var foo = injector.getValue("name", "another type");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("another type");
	});

	it("get instance with constructor forced parameters with getValueFromParam", function () {
		var FooClass = function(type){this.typeParam = type;};
		injector.mapClass("name", FooClass);
		injector.mapValue("type", "type");
		var foo = injector.getValueFromClass(FooClass, "another type");
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
		expect(foo.typeParam).toEqual("another type");
	});

  it("get instance with constructor using explicit inject array", function () {
  		var FooClass = function(a){this.typeParam = a;};
        FooClass.inject = ['type'];
  		injector.mapClass("name", FooClass);
  		injector.mapValue("type", "type");
  		var foo = injector.getValue("name");
  		expect(foo).not.toBeNull();
  		expect(foo).not.toBeUndefined();
  		expect(foo instanceof FooClass).toBeTruthy();
  		expect(foo.typeParam).toEqual("type");
  	});

  it("get instance with constructor using explicit inject array with multiple args", function () {
      var FooClass = function(a, b, c){this.typeParamA = a;this.typeParamB = b;this.typeParamC = c;};
      FooClass.inject = ['typeA', 'typeB', 'typeC'];
      injector.mapClass("name", FooClass);
      injector.mapValue("typeA", "typeA");
      injector.mapValue("typeB", "typeB");
      injector.mapValue("typeC", "typeC");
      var foo = injector.getValue("name");
      expect(foo).not.toBeNull();
      expect(foo).not.toBeUndefined();
      expect(foo instanceof FooClass).toBeTruthy();
      expect(foo.typeParamA).toEqual("typeA");
      expect(foo.typeParamB).toEqual("typeB");
      expect(foo.typeParamC).toEqual("typeC");
  });

  it("get instance with constructor using explicit inject array overriding existing type", function () {
      var FooClass = function(type){this.typeParam = type;};
      FooClass.inject = ['anotherType'];
      injector.mapClass("name", FooClass);
      injector.mapValue("type", "type");
      injector.mapValue("anotherType", "anotherType");
      var foo = injector.getValue("name");
      expect(foo).not.toBeNull();
      expect(foo).not.toBeUndefined();
      expect(foo instanceof FooClass).toBeTruthy();
      expect(foo.typeParam).toEqual("anotherType");
  });

  it("get instance with constructor using explicit inject array overriding existing type with multiple args", function () {
      var FooClass = function(typeA, typeB, typeC){this.typeParamA = typeA;this.typeParamB = typeB;this.typeParamC = typeC;};
      FooClass.inject = [null, 'anotherTypeB']; // Omit final otherwise falsey key
      injector.mapClass("name", FooClass);
      injector.mapValue("typeA", "typeA");
      injector.mapValue("typeB", "typeB");
      injector.mapValue("typeC", "typeC");
      injector.mapValue("anotherTypeB", "anotherTypeB");
      var foo = injector.getValue("name");
      expect(foo).not.toBeNull();
      expect(foo).not.toBeUndefined();
      expect(foo instanceof FooClass).toBeTruthy();
      expect(foo.typeParamA).toEqual("typeA");
      expect(foo.typeParamB).toEqual("anotherTypeB");
      expect(foo.typeParamC).toEqual("typeC");
  });

	it("get instance no singleton with getValue", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo1 = injector.getValue("name");
		var foo2 = injector.getValue("name");
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeFalsy();
	});

	it("get instance no singleton with getValueFromClass", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo1 = injector.getValueFromClass(FooClass);
		var foo2 = injector.getValueFromClass(FooClass);
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeFalsy();
	});

	it("get instance singleton with getValue", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass, true);
		var foo1 = injector.getValue("name");
		var foo2 = injector.getValue("name");
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeTruthy();
	});

	it("get instance singleton with getValueFromClass", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass, true);
		var foo1 = injector.getValueFromClass(FooClass);
		var foo2 = injector.getValueFromClass(FooClass);
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeTruthy();
	});

	it("get constructor params", function() {
		var f = function(name, age, other){};
		var names = infuse.getDependencies(f);
		expect(infuse.getDependencies(f)).toEqual(["name", "age", "other"]);
	});

    it("property injection with inject property using arguments", function () {
        var FooClass = function(){};
        injector.mapClass("name", FooClass, true);
        var TestClass = function(){
            this.renamedName = arguments[0];
        };
        TestClass.inject = ['name'];
        var inst = injector.createInstance(TestClass);
        expect(inst.renamedName instanceof FooClass).toBeTruthy();
    });

    it("property injection using string", function () {
        var FooClass = function(){};
        injector.mapClass("name", FooClass, true);
        var TestClass = function(){
            this['name'] = null;
        };
        var inst = injector.createInstance(TestClass);
        expect(inst.name instanceof FooClass).toBeTruthy();
    });

    it("property injection using string and inject method", function () {
        var FooClass = function(){};
        injector.mapClass("name", FooClass, true);
        var TestClass = function(){
            this['name'] = null;
        };
        var inst = new TestClass();
        injector.inject(inst);
        expect(inst.name instanceof FooClass).toBeTruthy();
    });

    it("dispose", function () {
		var FooClass = function(){};
		var InjecteeClass = function(){this.name1=null;this.name2=null;this.name3=null;};
		injector.mapValue("name1", "John");
		injector.mapClass("name2", FooClass);
		injector.mapClass("name3", FooClass, true);
		injector.dispose();
		expect(injector.hasMapping("name1")).toBeFalsy();
		expect(injector.hasMapping("name1")).toBeFalsy();
		expect(injector.hasMapping("name2")).toBeFalsy();
		expect(injector.hasMapping("name3")).toBeFalsy();
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.errors.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name2")}).toThrow(infuse.errors.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name3")}).toThrow(infuse.errors.NO_MAPPING_FOUND);
		var injectee = injector.createInstance(InjecteeClass);
		expect(injectee.name1).toBeNull();
		expect(injectee.name2).toBeNull();
		expect(injectee.name3).toBeNull();
	});

	it("post construct called", function () {
		var FooClass = function(){
			this.postConstructCalled = false;
		};
		FooClass.prototype = {
			postConstruct: function() {
				this.postConstructCalled = true;
			}
		};
		var foo = injector.createInstance(FooClass);
		expect(foo.postConstructCalled).toBeTruthy();
	});

	it("post construct absent", function () {
		var FooClass = function(){
			this.postConstructCalled = false;
		};
		var foo = injector.createInstance(FooClass);
		expect(foo.postConstructCalled).toBeFalsy();
	});

	it("scope", function () {
		var FooClass = function(){
			this.that = this;
		};
		var foo = injector.createInstance(FooClass)
		expect(foo.that).toEqual(foo);
	});

	it("child injector creation", function () {
		var child = injector.createChild();
		expect(child).not.toBeNull();
		expect(child).not.toBeUndefined();
		expect(child).not.toEqual(injector);
		expect(child instanceof infuse.Injector).toBeTruthy();
		expect(child.parent).toEqual(injector);
	});

	it("child injector don't get parent mapping", function () {
		injector.mapValue("name", "John");
		var child = injector.createChild();
		expect(child.hasMapping("name")).toBeFalsy();
	});

	it("child injector has inherited mapping", function () {
		injector.mapValue("name", "John");
		injector.mapValue("type", function(){});
		var child = injector.createChild();
		expect(child.hasInheritedMapping("name")).toBeTruthy();
		expect(child.hasInheritedMapping("type")).toBeTruthy();
	});

	it("child injector map value", function () {
		var child = injector.createChild();
		child.mapValue("name", "John");
		expect(child.hasMapping("name")).toBeTruthy();
	});

	it("child injector map parent value", function () {
		injector.mapValue("name", "John");
		var child = injector.createChild();
		var FooClass = function(){this.name=null;};
		var foo = child.createInstance(FooClass);
		expect(foo.name).toEqual("John");
	});

	it("child injector create class from parent mapping", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		var foo = child.createInstance(FooClass);
		expect(foo).not.toBeNull();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("child injector get instance from parent mapping with getValue", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		var foo = child.getValue("name");
		expect(foo).not.toBeNull();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("child injector get instance from parent mapping with getValueFromClass", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		var foo = child.getValueFromClass(FooClass);
		expect(foo).not.toBeNull();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("child injector get value from parent mapping", function () {
		var FooClass = function(){};
		injector.mapValue("name2", "John");
		var child = injector.createChild();
		var name = child.getValue("name2");
		expect(name).not.toBeNull();
		expect(name).toEqual("John");
	});

	it("child injector inject value from parent mapping", function () {
		var FooClass = function(){this.name=null;};
		injector.mapValue("name", "John");
		var foo = new FooClass();
		var child = injector.createChild();
		child.inject(foo);
		expect(foo.name).toEqual("John");
	});

	it("child injector inject class from parent mapping", function () {
		var child = injector.createChild();
		var FooClass = function(){this.instance=null;};
		var InstanceClass = function(){};
		injector.mapClass("instance", InstanceClass);
		var foo = new FooClass();
		child.inject(foo);
		expect(foo.instance).not.toBeNull();
		expect(foo.instance instanceof InstanceClass).toBeTruthy();
	});

	it("child injector inject class with constructor in itself throws error with getValue", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValue("name")}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("child injector inject class with constructor in itself throws error with getValueFromClass", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValueFromClass(FooClass)}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("child injector inject class in itself throws error with getValue", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValue("name")}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("child injector inject class in itself throws error with getValueFromClass", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValueFromClass(FooClass)}).toThrow(infuse.errors.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("child injector override mapping value", function () {
		var FooClass = function(){this.name=null;};
		injector.mapValue("name", "John");
		var child = injector.createChild();
		child.mapValue("name", "David");
		var foo = child.createInstance(FooClass);
		expect(foo.name).toEqual("David");
	});

	it("child injector override mapping class", function () {
		var FooClass = function(){this.type="parent class";};
		var FooClassChild = function(){this.type="child class";};
		var InstanceClass = function(){this.name=null};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		child.mapClass("name", FooClassChild);
		var instance = child.createInstance(InstanceClass);
		expect(instance.name.type).toEqual("child class");
		expect(instance.name instanceof FooClassChild).toBeTruthy();
	});

	it("child injector create instance and get parent and child mapping", function () {
		var injector = new infuse.Injector();
		injector.mapValue("name", "John");
		var child = injector.createChild();
		child.mapValue("type", "male");
		var FooClass = function() {
			this.name = null;
			this.type = null;
		}
		var foo = child.createInstance(FooClass);
		expect(foo.name).toEqual("John");
		expect(foo.type).toEqual("male");
	});

	it("child injector get instance and get parent and child mapping with getValue", function () {
		var injector = new infuse.Injector();
		injector.mapValue("name", "John");
		var child = injector.createChild();
		child.mapValue("type", "male");
		var FooClass = function() {
			this.name = null;
			this.type = null;
		}
		child.mapClass("foo", FooClass);
		var foo = child.getValue("foo");
		expect(foo.name).toEqual("John");
		expect(foo.type).toEqual("male");
	});

	it("child injector get instance and get parent and child mapping with getValueFromClass", function () {
		var injector = new infuse.Injector();
		injector.mapValue("name", "John");
		var child = injector.createChild();
		child.mapValue("type", "male");
		var FooClass = function() {
			this.name = null;
			this.type = null;
		}
		child.mapClass("foo", FooClass);
		var foo = child.getValueFromClass(FooClass);
		expect(foo.name).toEqual("John");
		expect(foo.type).toEqual("male");
	});

	it("child injector get injection from multi layers with getValue", function () {
		var injector = new infuse.Injector();
		injector.mapValue("name", "John");
		var child1 = injector.createChild();
		var child2 = child1.createChild();
		var child3 = child2.createChild();
		var child4 = child3.createChild();
		var FooClass = function(){this.name = null;};
		var foo1 = child4.createInstance(FooClass);
		child4.mapClass("foo", FooClass);
		var foo2 = child4.getValue("foo");
		expect(foo1.name).toEqual("John");
		expect(foo2.name).toEqual("John");
	});

	it("child injector get injection from multi layers with getValueFromClass", function () {
		var injector = new infuse.Injector();
		injector.mapValue("name", "John");
		var child1 = injector.createChild();
		var child2 = child1.createChild();
		var child3 = child2.createChild();
		var child4 = child3.createChild();
		var FooClass = function(){this.name = null;};
		var foo1 = child4.createInstance(FooClass);
		child4.mapClass("foo", FooClass);
		var foo2 = child4.getValueFromClass(FooClass);
		expect(foo1.name).toEqual("John");
		expect(foo2.name).toEqual("John");
	});

	it("child injector resolve its value with from a parent instantiation", function () {
		var Parent = function() {
			this.name = null;
		};
		injector.mapClass("parent", Parent);
		var child = injector.createChild();
		child.mapValue("name", "John");
		expect(child.getValue("parent").name).toEqual("John");
	});

	it("child injector resolve its value with from different parents (getValue)", function () {
		var Parent = function() {
			this.depth1 = null;
			this.depth2 = null;
			this.depth3 = null;
		};

		injector.mapClass("parent", Parent);
		injector.mapValue("depth1", "depth 1");

		var child1 = injector.createChild();
		child1.mapValue("depth2", "depth 2");

		var child2 = child1.createChild();
		child2.mapValue("depth3", "depth 3");

		expect(child2.getValue("parent").depth1).toEqual("depth 1");
		expect(child2.getValue("parent").depth2).toEqual("depth 2");
		expect(child2.getValue("parent").depth3).toEqual("depth 3");

		expect(child1.getValue("parent").depth1).toEqual("depth 1");
		expect(child1.getValue("parent").depth2).toEqual("depth 2");
		expect(child1.getValue("parent").depth3).toEqual(null);

		expect(injector.getValue("parent").depth1).toEqual("depth 1");
		expect(injector.getValue("parent").depth2).toEqual(null);
		expect(injector.getValue("parent").depth3).toEqual(null);

	});

	it("child injector resolve its value with from different parents (createInstance)", function () {
		var Parent = function() {
			this.depth1 = null;
			this.depth2 = null;
			this.depth3 = null;
		};

		injector.mapClass("parent", Parent);
		injector.mapValue("depth1", "depth 1");

		var child1 = injector.createChild();
		child1.mapValue("depth2", "depth 2");

		var child2 = child1.createChild();
		child2.mapValue("depth3", "depth 3");

		expect(child2.createInstance(Parent).depth1).toEqual("depth 1");
		expect(child2.createInstance(Parent).depth2).toEqual("depth 2");
		expect(child2.createInstance(Parent).depth3).toEqual("depth 3");

		expect(child1.createInstance(Parent).depth1).toEqual("depth 1");
		expect(child1.createInstance(Parent).depth2).toEqual("depth 2");
		expect(child1.createInstance(Parent).depth3).toEqual(null);

		expect(injector.createInstance(Parent).depth1).toEqual("depth 1");
		expect(injector.createInstance(Parent).depth2).toEqual(null);
		expect(injector.createInstance(Parent).depth3).toEqual(null);

	});

	it("strict mode is not enabled by default", function () {
		expect(injector.strictMode).toBeFalsy();
	});

	it("missing dependencies in strict mode should throw an error", function () {
		injector.strictMode = true;
		var FooClass = function(type){this.typeParam = type;};
  		injector.mapClass("name", FooClass);
  		injector.mapValue("type", "type");
		expect(function(){injector.getValue("name")}).toThrow(infuse.errors.DEPENDENCIES_MISSING_IN_STRICT_MODE);
	});

	it("strict mode is inherited in child injectors", function () {
		injector.strictMode = true;
		var childInjector = injector.createChild();
		var FooClass = function(type){this.typeParam = type;};
  		childInjector.mapClass("name", FooClass);
  		childInjector.mapValue("type", "type");
		expect(function(){childInjector.getValue("name")}).toThrow(infuse.errors.DEPENDENCIES_MISSING_IN_STRICT_MODE);
	});

	it("throwOnMissing is enabled by default", function () {
		expect(injector.throwOnMissing).toBeTruthy();
	});

	describe("throwOnMissing", function() {

		function getErrorMessage(callback) {
			try {
				callback();
			} catch (e) {
				return e.message;
			}
		}

		beforeEach(function() {
			injector.throwOnMissing = true;
			injector.mapClass("fooClass", function(missing){});
		});

		it("causes requesting a missing value to throw", function () {
			expect(function(){injector.getValue("missing")}).toThrow();
			expect(function(){injector.getValue("fooClass")}).toThrow();
			expect(function(){injector.createInstance(function(missing) {})}).toThrow();
		});

		it("throws an error that describes the problem when instantiating", function() {
			expect(getErrorMessage(function(){injector.getValue("fooClass")})).toContain("missing");
			var instantiationError = getErrorMessage(function(){injector.createInstance(function customClassName(not_a_predefined_string){})});
			expect(instantiationError).toContain("not_a_predefined_string");
			expect(instantiationError).toContain("customClassName");
		});

		it("is inherited in child injectors", function() {
			injector.throwOnMissing = false;
			var childInjector = injector.createChild();
			expect(childInjector.throwOnMissing).toBeFalsy();
		});

	});

	describe("getEsprima()", function() {
		it("should return ${GLOBAL}.esprima if available", function() {
			var oldEsprima = utils.getGlobal().esprima;
			utils.getGlobal().esprima = {};

			expect(infuse.getEsprima()).toBe(utils.getGlobal().esprima);

			utils.getGlobal().esprima = oldEsprima;
		});

		it("should attempt to require() if not already available", function() {
			var fakeEsprima = {};
			var oldRequire = utils.getGlobal().require;
			utils.getGlobal().require = jasmine.createSpy("require");
			utils.getGlobal().require.andReturn(fakeEsprima);

			expect(infuse.getEsprima()).toBe(fakeEsprima);
			expect(utils.getGlobal().require).toHaveBeenCalled();

			utils.getGlobal().require = oldRequire;
		});

		it("should not error if all of the above fail", function() {
			expect(function() { infuse.getEsprima() }).not.toThrow();
		});
	});

	describe("getDependenciesFromString()", function() {
		var esprima;
		var ast;
		var testString;
		var expectedTestOutput;

		beforeEach(function() {
			testString = "i am a test string";
			expectedTestOutput = [ "foo", "bar" ];
			ast = {
			    "type": "Program",
			    "body": [
			        {
			            "type": "ClassDeclaration",
			            "id": {
			                "type": "Identifier",
			                "name": "Foo"
			            },
			            "superClass": null,
			            "body": {
			                "type": "ClassBody",
			                "body": [
			                    {
			                        "type": "MethodDefinition",
			                        "key": {
			                            "type": "Identifier",
			                            "name": "constructor"
			                        },
			                        "computed": false,
			                        "value": {
			                            "type": "FunctionExpression",
			                            "id": null,
			                            "params": [
			                                {
			                                    "type": "Identifier",
			                                    "name": "foo"
			                                },
			                                {
			                                    "type": "Identifier",
			                                    "name": "bar"
			                                }
			                            ],
			                            "defaults": [],
			                            "body": {
			                                "type": "BlockStatement",
			                                "body": []
			                            },
			                            "generator": false,
			                            "expression": false
			                        },
			                        "kind": "constructor",
			                        "static": false
			                    }
			                ]
			            }
			        }
			    ],
			    "sourceType": "script"
			};
			esprima = jasmine.createSpyObj("esprima", [ "parse" ]);
			esprima.parse.andReturn(ast);

			spyOn(infuse, "getEsprima").andReturn(esprima);
		});

		it("should be able to extract from ES5 classes without esprima", function() {
			var string = function test(foo, bar) { baz = 'quux'; } + "";
			expect(JSON.stringify(infuse.getDependenciesFromString(string)))
				.toBe(JSON.stringify([ "foo", "bar" ]));

			expect(infuse.getEsprima).not.toHaveBeenCalled();
		});

		it("should attempt to use esprima if the regexes fail", function() {
			infuse.getDependenciesFromString(testString);

			expect(infuse.getEsprima).toHaveBeenCalled();
		});

		it("should traverse esprima AST for ES2015 classes", function() {
			expect(JSON.stringify(infuse.getDependenciesFromString(testString)))
				.toBe(JSON.stringify(expectedTestOutput));
		});
	});

});
