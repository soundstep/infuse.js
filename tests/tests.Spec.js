if (typeof require !== 'undefined') {
	var infuse = require('../src/infuse');
	var utils = require('./lib/utils');
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
		expect(function(){injector.mapValue(1, 1)}).toThrow(infuse.InjectorError.MAPPING_BAD_PROP);
	});

	it("mapping value bad value throws error", function () {
		expect(function(){injector.mapValue("name")}).toThrow(infuse.InjectorError.MAPPING_BAD_VALUE + "name");
	});

	it("mapping class no class throws error", function () {
		expect(function(){injector.mapClass("name")}).toThrow(infuse.InjectorError.MAPPING_BAD_CLASS + "name");
	});

	it("mapping class wrong class throws error with non-class", function () {
		expect(function(){injector.mapClass("name", 1)}).toThrow(infuse.InjectorError.MAPPING_BAD_CLASS + "name");
	});

	it("already has mapping value throws error", function () {
		injector.mapValue("name", "John");
		expect(function(){injector.mapValue("name", "John")}).toThrow(infuse.InjectorError.MAPPING_ALREADY_EXISTS + "name");
	});

	it("already has mapping class throws error", function () {
		var InstanceClass = function(){};
		injector.mapClass("name", InstanceClass);
		expect(function(){injector.mapClass("name", InstanceClass)}).toThrow(infuse.InjectorError.MAPPING_ALREADY_EXISTS + "name");
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
		expect(function(){injector.getValue("name")}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name", undefined)}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name", null)}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
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
		expect(function(){injector.getValue("name")}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("inject class with constructor in itself throws error with getValueFromClass", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("inject class in itself throws error with getValue", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValue("name")}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("inject class in itself throws error with getValueFromClass", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
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
		expect(function(){injector.createInstance()}).toThrow(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
	});

	it("create instance invalid param throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.createInstance(1)}).toThrow(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
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
		var FooClass = function(p1, p2, p3, p4, p5){
			this.param1 = p1;
			this.param2 = p2;
			this.param3 = p3;
			this.param4 = p4;
			this.param5 = p5;
		};
		var foo = injector.createInstance(FooClass, null, undefined, "forced");
		expect(foo.param1).toEqual(p1);
		expect(foo.param2).toEqual(p2);
		expect(foo.param3).toEqual("forced");
		expect(foo.param4).toBeUndefined();
		expect(foo.param5).toBeUndefined();
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
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
	});

	it("get instance bad singleton parameter throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.mapClass("name", FooClass, "bad")}).toThrow(infuse.InjectorError.MAPPING_BAD_SINGLETON + "name");
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
		var names = infuse.getConstructorParams(f);
		expect(infuse.getConstructorParams(f)).toEqual(["name", "age", "other"]);
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
		expect(function(){injector.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name2")}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
		expect(function(){injector.getValue("name3")}).toThrow(infuse.InjectorError.NO_MAPPING_FOUND);
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
		expect(function(){child.getValue("name")}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("child injector inject class with constructor in itself throws error with getValueFromClass", function () {
		var FooClass = function(name){this.nameParam=name;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
	});

	it("child injector inject class in itself throws error with getValue", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValue("name")}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
	});

	it("child injector inject class in itself throws error with getValueFromClass", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		var child = injector.createChild();
		expect(function(){child.getValueFromClass(FooClass)}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
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

});
