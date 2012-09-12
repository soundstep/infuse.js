/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * The Original Code is infuse.js.
 *
 * The Initial Developer of the Original Code is Romuald Quantin
 * romu@soundstep.com (www.soundstep.com)
 *
 * Initial Developer are Copyright (C) 2008-2012 Soundstep. All Rights Reserved.
 */

;(function(infuse, undefined) {
    "use strict";

	infuse.version = "0.5.0";

	// regex from angular JS (https://github.com/angular/angular.js)
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	if(!Array.prototype.contains) {
	    Array.prototype.contains = function(value) {
	        var i = this.length;
	        while (i--) {
	            if (this[i] === value) return true;
	        }
	        return false;
	    };
	}

	infuse.InjectorError = {
		MAPPING_BAD_PROP: "[Error infuse.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected",
		MAPPING_BAD_VALUE: "[Error infuse.Injector.mapClass/mapValue] the sescond parameter is invalid, it can't null or undefined, with property: ",
		MAPPING_BAD_CLASS: "[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ",
		MAPPING_BAD_SINGLETON: "[Error infuse.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ",
		MAPPING_ALREADY_EXISTS: "[Error infuse.Injector.mapClass/mapValue] this mapping already exists, with property: ",
		CREATE_INSTANCE_INVALID_PARAM: "[Error infuse.Injector.createInstance] invalid parameter, a function is expected",
		GET_INSTANCE_NO_MAPPING: "[Error infuse.Injector.getInstance] no mapping found",
		INJECT_INSTANCE_IN_ITSELF_PROPERTY: "[Error infuse.Injector.getInjectedValue] A matching property has been found in the target, you can't inject an instance in itself",
		INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR: "[Error infuse.Injector.getInjectedValue] A matching constructor parameter has been found in the target, you can't inject an instance in itself"
	};

	var MappingVO = function(prop, value, cl, singleton) {
		this.prop = prop;
		this.value = value;
		this.cl = cl;
		this.singleton = singleton || false;
	};

	var validateProp = function(prop) {
		if (typeof prop !== "string") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_PROP);
		}
	};

	var validateValue = function(prop, val) {
		if (!val) {
			throw new Error(infuse.InjectorError.MAPPING_BAD_VALUE + prop);
		}
	};

	var validateClass = function(prop, val) {
		if (typeof val !== "function") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_CLASS + prop);
		}
	};

	var validateBooleanSingleton = function(prop, singleton) {
		if (typeof singleton !== "boolean") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_SINGLETON + prop);
		}
	};

	var validateConstructorInjectionLoop = function(name, cl) {
		var params = getConstructorParams(cl);
		if (params.contains(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
		}
	};

	var validatePropertyInjectionLoop = function(name, target) {
		if (target.hasOwnProperty(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
		}
	};

	var getConstructorParams = function(cl) {
		var args = [];
		var clStr = cl.toString().replace(STRIP_COMMENTS, '');
		var argsFlat = clStr.match(FN_ARGS);
		var spl = argsFlat[1].split(FN_ARG_SPLIT);
		for (var i=0; i<spl.length; i++) {
			var arg = spl[i];
			arg.replace(FN_ARG, function(all, underscore, name){
				args.push(name);
	        });
		}
		return args;
	};

	var instantiateIgnoringConstructor = function() {
		if (typeof arguments[0] !== "function") {
			throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
		}
		var TargetClass = arguments[0];
		var args = [null];
		for (var i=1; i<arguments.length; i++) {
			args.push(arguments[i]);
		}
		return new (Function.prototype.bind.apply(TargetClass, args));
	};

	infuse.Injector = function() {
		this.mappings = {};
		this.parent = null;
	};

	infuse.Injector.prototype = {

		createChild: function() {
			var injector = new infuse.Injector();
			injector.parent = this;
			return injector;
		},

		getMappingVo: function(prop) {
			if (!this.mappings) return null;
			if (this.mappings[prop]) return this.mappings[prop];
			if (this.parent) return this.parent.getMappingVo(prop);
			return null;
		},

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

		hasInheritedMapping: function(prop) {
			return !!this.getMappingVo(prop);
		},

		getMapping: function(value) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.value === value || vo.cl === value) {
					return vo.prop;
				}
			}
		},

		getMappingValue: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) return undefined;
			if (vo.cl) return vo.cl;
			if (vo.value) return vo.value;
			return undefined;
		},

		instantiate: function(TargetClass) {
			if (typeof TargetClass !== "function") {
				throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
			}
			var TargetClass = arguments[0];
			var args = [null];
			var params = getConstructorParams(TargetClass, this.mappings);
			for (var i=0; i<params.length; i++) {
				if (arguments[i+1]) {
					// argument found
					args.push(arguments[i+1]);
				}
				else {
					var name = params[i];
					// no argument found
					var vo = this.getMappingVo(name);
					if (!!vo) {
						// found mapping
						var val = this.getInjectedValue(vo, name);
						args.push(val);
					}
					else {
						// no mapping found
						args.push(undefined);
					}
				}
			}
			return new (Function.prototype.bind.apply(TargetClass, args));
		},

		inject: function(target) {
			if (this.parent) {
				this.parent.inject(target);
			}
			for (var name in this.mappings) {
				var vo = this.getMappingVo(name);
				if (target.hasOwnProperty(vo.prop)) {
					var val = this.getInjectedValue(vo, name);
					target[name] = val;
				}
			}
			if (typeof target.postConstruct === 'function') {
				target.postConstruct();
			}
			return this;
		},

		getInjectedValue: function(vo, name) {
			var val = vo.value;
			var injectee;
			if (vo.cl) {
				var params = getConstructorParams(vo.cl);
				if (vo.singleton) {
					if (!vo.value) {
						validateConstructorInjectionLoop(name, vo.cl);
						vo.value = this.instantiate(vo.cl);
						injectee = vo.value;
					}
					val = vo.value;
				}
				else {
					validateConstructorInjectionLoop(name, vo.cl);
					val = this.instantiate(vo.cl);
					injectee = val;
				}
			}
			if (injectee) {
				validatePropertyInjectionLoop(name, injectee);
				this.inject(injectee);
			}
			return val;
		},

		createInstance: function() {
			var instance = this.instantiate.apply(this, arguments);
			this.inject(instance);
			return instance;
		},

		getInstance: function(cl) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.cl == cl) {
					if (vo.singleton) {
						if (!vo.value) vo.value = this.createInstance.apply(this, arguments);
						return vo.value;
					}
					else {
						return this.createInstance.apply(this, arguments);
					}
				}
			}
			if (this.parent) {
				return this.parent.getInstance(cl);
			} else {
				throw new Error(infuse.InjectorError.GET_INSTANCE_NO_MAPPING);
			}
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

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
	    define("infuse", infuse);
	}

})(this['infuse'] = this['infuse'] || {});

