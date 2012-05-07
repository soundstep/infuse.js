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

	it("get mapping value value", function () {
		injector.mapValue("name", "John");
		expect(injector.getMappingValue("name")).toEqual("John");
	});

	it("get mapping value class", function () {
		var InstanceClass = function(){};
		injector.mapValue("name", InstanceClass);
		expect(injector.getMappingValue("name")).toEqual(InstanceClass);
	});

	it("get non-existing mapping value returns undefined", function () {
		expect(injector.getMappingValue("name")).toBeUndefined();
	});

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

	it("inject class in itself throws error", function () {
		var FooClass = function(){this.name=null;};
		injector.mapClass("name", FooClass);
		expect(function(){injector.getInstance(FooClass)}).toThrow(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF);
	});

	it("create instance", function () {
		var FooClass = function(){};
		var foo = injector.createInstance(FooClass);
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
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

	it("get instance", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo = injector.getInstance(FooClass);
		expect(foo).not.toBeNull();
		expect(foo).not.toBeUndefined();
		expect(foo instanceof FooClass).toBeTruthy();
	});

	it("get instance no mapping throws error", function () {
		var FooClass = function(){this.name=null;};
		expect(function(){injector.getInstance(FooClass)}).toThrow(infuse.InjectorError.GET_INSTANCE_NO_MAPPING);
	});

	it("get instance bad singleton parameter throws error", function () {
		var FooClass = function(){};
		expect(function(){injector.mapClass("name", FooClass, "bad")}).toThrow(infuse.InjectorError.MAPPING_BAD_SINGLETON + "name");
	});

	it("get instance no singleton", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass);
		var foo1 = injector.getInstance(FooClass);
		var foo2 = injector.getInstance(FooClass);
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeFalsy();
	});

	it("get instance singleton", function () {
		var FooClass = function(){};
		injector.mapClass("name", FooClass, true);
		var foo1 = injector.getInstance(FooClass);
		var foo2 = injector.getInstance(FooClass);
		expect(foo1 instanceof FooClass).toBeTruthy();
		expect(foo2 instanceof FooClass).toBeTruthy();
		expect(foo1 === foo2).toBeTruthy();
	});

	it("dispose", function () {
		var FooClass = function(){};
		var InjecteeClass = function(){this.name1=null;this.name2=null;this.name3=null;};
		injector.mapValue("name1", "John");
		injector.mapClass("name2", FooClass);
		injector.mapClass("name3", FooClass, true);
		injector.dispose();
		expect(injector.hasMapping("name1")).toBeFalsy();
		expect(injector.hasMapping("name2")).toBeFalsy();
		expect(injector.hasMapping("name3")).toBeFalsy();
		expect(function(){injector.getInstance(FooClass)}).toThrow(infuse.InjectorError.GET_INSTANCE_NO_MAPPING);
		var injectee = injector.createInstance(InjecteeClass);
		expect(injectee.name1).toBeNull();
		expect(injectee.name2).toBeNull();
		expect(injectee.name3).toBeNull();
	});

});
