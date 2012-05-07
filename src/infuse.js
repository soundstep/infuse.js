var infuse = window.infuse || {};

(function() {

	infuse.InjectorError = {
		MAPPING_BAD_PROP: "[Error infuse.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected",
		MAPPING_BAD_VALUE: "[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, it can't null or undefined, with property: ",
		MAPPING_BAD_CLASS: "[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ",
		MAPPING_BAD_SINGLETON: "[Error infuse.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ",
		MAPPING_ALREADY_EXISTS: "[Error infuse.Injector.mapClass/mapValue] this mapping already exists, with property: ",
		CREATE_INSTANCE_INVALID_PARAM: "[Error infuse.Injector.createInstance] invalid parameter, a function is expected",
		GET_INSTANCE_NO_MAPPING: "[Error infuse.Injector.getInstance] no mapping found",
		INJECT_INSTANCE_IN_ITSELF: "[Error infuse.Injector.inject] A matching property has been found in the target, you can't inject an instance in itself"
	};

	var MappingVO = function(prop, value, cl, singleton) {
		this.prop = prop;
		this.value = value;
		this.class = cl;
		this.singleton = singleton || false;
	};

	var validateProp = function(prop) {
		if (typeof prop !== "string") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_PROP);
		}
	}

	var validateValue = function(prop, val) {
		if (!val) {
			throw new Error(infuse.InjectorError.MAPPING_BAD_VALUE + prop);
		}
	}

	var validateClass = function(prop, val) {
		if (typeof val !== "function") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_CLASS + prop);
		}
	}

	var validateBooleanSingleton = function(prop, singleton) {
		if (typeof singleton !== "boolean") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_SINGLETON + prop);
		}
	}

	var instantiate = function() {
		if (typeof arguments[0] !== "function") {
			throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
		}
		var TargetClass = arguments[0];
		var args = [null];
		for (var i=1; i<arguments.length; i++) {
			args.push(arguments[i]);
		}
		return new (Function.prototype.bind.apply(TargetClass, args));
	}

	infuse.Injector = function() {
		this.mappings = {};
	};

	infuse.Injector.prototype = {

		mapValue: function(prop, val) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateValue(prop, val);
			this.mappings[prop] = new MappingVO(prop, val);
			return this;
		},

		mapClass: function(prop, cl, singleton) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateClass(prop, cl);
			if (singleton) validateBooleanSingleton(prop, singleton);
			this.mappings[prop] = new MappingVO(prop, null, cl, singleton);
			return this;
		},

		removeMapping: function(prop) {
			this.mappings[prop] = null;
			delete this.mappings[prop];
			return this;
		},

		hasMapping: function(prop) {
			return !!this.mappings[prop];
		},

		getMapping: function(value) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.value === value || vo.class === value) {
					return vo.prop;
				}
			}
		},

		getMappingValue: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) return undefined;
			if (vo.class) return vo.class;
			if (vo.value) return vo.value;
			return undefined;
		},

		inject: function(target) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (target.hasOwnProperty(vo.prop)) {
					var val = vo.value;
					var injectee;
					if (vo.class) {
						if (vo.singleton) {
							if (!vo.value) {
								vo.value = instantiate(vo.class);
								injectee = vo.value;
							}
							val = vo.value;
						}
						else {
							val = instantiate(vo.class);
							injectee = val;
						}
					}
					target[name] = val;
					if (injectee) {
						if (injectee.hasOwnProperty(name)) {
							throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF);
						}
						this.inject(injectee);
					}

				}
			}
			if (typeof target.postConstruct === 'function') {
				target.postConstruct();
			}
			return this;
		},

		createInstance: function() {
			var instance = instantiate.apply(null, arguments);
			this.inject(instance);
			return instance;
		},

		getInstance: function(cl) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.class == cl) {
					if (vo.singleton) {
						if (!vo.value) vo.value = this.createInstance(cl);
						return vo.value;
					}
					else {
						return this.createInstance(cl);
					}
				}
			}
			throw new Error(infuse.InjectorError.GET_INSTANCE_NO_MAPPING);
		},

		dispose: function() {
			this.mappings = {};
		}

	};

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target != "function") {
				throw new Error("Error, you must bind a function.");
			}
			var args = Array.prototype.slice.call(arguments, 1); // for normal call
			var bound = function () {
				if (this instanceof bound) {
					var F = function(){};
					F.prototype = target.prototype;
					var self = new F;
					var result = target.apply(
						self,
						args.concat(Array.prototype.slice.call(arguments))
					);
					if (Object(result) === result) {
						return result;
					}
					return self;
				} else {
					return target.apply(
						that,
						args.concat(Array.prototype.slice.call(arguments))
					);
				}
			};
			return bound;
		};
	}

})();

