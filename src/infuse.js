/*
Copyright (c) | 2016 | infuse.js | Romuald Quantin | www.soundstep.com | romu@soundstep.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(infuse) {

    'use strict';

    infuse.version = '1.0.1';

    // regex from angular JS (https://github.com/angular/angular.js)
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,\s*/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    function contains(arr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === value) {
                return true;
            }
        }
        return false;
    }

    infuse.errors = {
        MAPPING_BAD_PROP: '[Error infuse.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected',
        MAPPING_BAD_VALUE: '[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, it can\'t null or undefined, with property: ',
        MAPPING_BAD_CLASS: '[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ',
        MAPPING_BAD_SINGLETON: '[Error infuse.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ',
        MAPPING_ALREADY_EXISTS: '[Error infuse.Injector.mapClass/mapValue] this mapping already exists, with property: ',
        CREATE_INSTANCE_INVALID_PARAM: '[Error infuse.Injector.createInstance] invalid parameter, a function is expected',
        NO_MAPPING_FOUND: '[Error infuse.Injector.getInstance] no mapping found',
        INJECT_INSTANCE_IN_ITSELF_PROPERTY: '[Error infuse.Injector.getInjectedValue] A matching property has been found in the target, you can\'t inject an instance in itself',
        INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR: '[Error infuse.Injector.getInjectedValue] A matching constructor parameter has been found in the target, you can\'t inject an instance in itself',
        DEPENDENCIES_MISSING_IN_STRICT_MODE: '[Error infuse.Injector.getDependencies] An "inject" property (array) that describes the dependencies is missing in strict mode.'
    };

    var MappingVO = function(prop, value, cl, singleton) {
        this.prop = prop;
        this.value = value;
        this.cl = cl;
        this.singleton = singleton || false;
    };

    var validateProp = function(prop) {
        if (typeof prop !== 'string') {
            throw new Error(infuse.errors.MAPPING_BAD_PROP);
        }
    };

    var validateValue = function(prop, val) {
        if (val === undefined || val === null) {
            throw new Error(infuse.errors.MAPPING_BAD_VALUE + prop);
        }
    };

    var validateClass = function(prop, val) {
        if (typeof val !== 'function') {
            throw new Error(infuse.errors.MAPPING_BAD_CLASS + prop);
        }
    };

    var validateBooleanSingleton = function(prop, singleton) {
        if (typeof singleton !== 'boolean') {
            throw new Error(infuse.errors.MAPPING_BAD_SINGLETON + prop);
        }
    };

    var validateConstructorInjectionLoop = function(name, cl) {
        var params = infuse.getDependencies(cl);
        if (contains(params, name)) {
            throw new Error(infuse.errors.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
        }
    };

    var validatePropertyInjectionLoop = function(name, target) {
        if (target.hasOwnProperty(name)) {
            throw new Error(infuse.errors.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
        }
    };

    infuse.Injector = function() {
        this.mappings = {};
        this.parent = null;
        this.strictMode = false;
        this.throwOnMissing = true;
    };

    infuse.getDependencies = function(cl) {
        var args = [];
        var deps;

        function extractName(all, underscore, name) {
            args.push(name);
        }

        if (cl.hasOwnProperty('inject') && Object.prototype.toString.call(cl.inject) === '[object Array]' && cl.inject.length > 0) {
            deps = cl.inject;
        }

        var clStr = cl.toString().replace(STRIP_COMMENTS, '');
        var spl = this.getDependenciesFromString(clStr);

        for (var i=0, l=spl.length; i<l; i++) {
            // Only override arg with non-falsey deps value at same key
            var arg = (deps && deps[i]) ? deps[i] : spl[i];
            arg.replace(FN_ARG, extractName);
        }

        return args;
    };

    infuse.getEsprima = function() {
        var esprima = false;
        try {
            esprima = esprima || window.esprima;
        } catch (e) {}

        try {
            esprima = esprima || global.esprima;
        } catch (e) {}

        try {
            esprima = esprima || (typeof global !== "undefined" ? global : window).require("esprima");
        } catch (e) {}

        return esprima;
    }

    infuse.getDependenciesFromString = function(clStr) {
        try {
            var argsFlat = clStr.match(FN_ARGS);
            var spl = argsFlat[1].split(FN_ARG_SPLIT);
        } catch (firstE) {
            var esprima = this.getEsprima();
            if (esprima) {
                try {
                    var tree = esprima.parse(clStr);
                    if (tree.body[0].type === "ClassDeclaration") {
                        var classMethods = tree.body[0].body.body;
                        var constructor = classMethods.filter(function(method) {
                                return method.kind === "constructor"
                            })[0];
                        if (constructor) {
                            spl = constructor.value
                                .params
                                .filter(function(param) { return param.type === "Identifier" })
                                .map(function(param) { return param.name; });
                        }
                    } else {
                        throw firstE;
                    }
                } catch (e) {
                    throw e;
                }
            } else {
                if (/^class/.test(clStr)) {
                    console.log("infuse.js requires esprima to parse ES2015 classes.");
                }
                throw firstE;
            }
        }

        return spl;
    };

    infuse.Injector.prototype = {

        createChild: function() {
            var injector = new infuse.Injector();
            injector.parent = this;
            injector.strictMode = this.strictMode;
            injector.throwOnMissing = this.throwOnMissing;
            return injector;
        },

        getMappingVo: function(prop) {
            if (!this.mappings) {
                return null;
            }
            if (this.mappings[prop]) {
                return this.mappings[prop];
            }
            if (this.parent) {
                return this.parent.getMappingVo(prop);
            }
            return null;
        },

        mapValue: function(prop, val) {
            if (this.mappings[prop]) {
                throw new Error(infuse.errors.MAPPING_ALREADY_EXISTS + prop);
            }
            validateProp(prop);
            validateValue(prop, val);
            this.mappings[prop] = new MappingVO(prop, val, undefined, undefined);
            return this;
        },

        mapClass: function(prop, cl, singleton) {
            if (this.mappings[prop]) {
                throw new Error(infuse.errors.MAPPING_ALREADY_EXISTS + prop);
            }
            validateProp(prop);
            validateClass(prop, cl);
            if (singleton) {
                validateBooleanSingleton(prop, singleton);
            }
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
                if (this.mappings.hasOwnProperty(name)) {
                    var vo = this.mappings[name];
                    if (vo.value === value || vo.cl === value) {
                        return vo.prop;
                    }
                }
            }
            return undefined;
        },

        getValue: function(prop) {
            var vo = this.mappings[prop];
            if (!vo) {
                if (this.parent) {
                    vo = this.parent.getMappingVo.apply(this.parent, arguments);
                }
                else {
                    throw new Error(infuse.errors.NO_MAPPING_FOUND);
                }
            }
            if (vo.cl) {
                var args = Array.prototype.slice.call(arguments);
                args[0] = vo.cl;
                if (vo.singleton) {
                    if (!vo.value) {
                        vo.value = this.createInstance.apply(this, args);
                    }
                    return vo.value;
                }
                else {
                    return this.createInstance.apply(this, args);
                }
            }
            return vo.value;
        },

        getClass: function(prop) {
            var vo = this.mappings[prop];
            if (!vo) {
                if (this.parent) {
                    vo = this.parent.getMappingVo.apply(this.parent, arguments);
                }
                else {
                    return undefined;
                }
            }
            if (vo.cl) {
                return vo.cl;
            }
            return undefined;
        },

        instantiate: function(TargetClass) {
            if (typeof TargetClass !== 'function') {
                throw new Error(infuse.errors.CREATE_INSTANCE_INVALID_PARAM);
            }
            if (this.strictMode && !TargetClass.hasOwnProperty('inject')) {
                throw new Error(infuse.errors.DEPENDENCIES_MISSING_IN_STRICT_MODE);
            }
            var args = [null];
            var params = infuse.getDependencies(TargetClass);
            for (var i=0, l=params.length; i<l; i++) {
                if (arguments.length > i+1 && arguments[i+1] !== undefined && arguments[i+1] !== null) {
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
                        if (this.throwOnMissing) {
                            // throw new Error(infuse.errors.NO_MAPPING_FOUND + " for dependency '" + name + "' when instantiating '" + TargetClass.name + "'");
                            throw new Error(infuse.errors.NO_MAPPING_FOUND + ' for dependency "' + name + '" when instantiating "' + TargetClass.name + '"');
                        }
                        args.push(undefined);
                    }
                }
            }
            return new (Function.prototype.bind.apply(TargetClass, args))();
        },

        inject: function (target, isParent) {
            if (this.parent) {
                this.parent.inject(target, true);
            }
            for (var name in this.mappings) {
                if (this.mappings.hasOwnProperty(name)) {
                    var vo = this.getMappingVo(name);
                    if (target.hasOwnProperty(vo.prop) || (target.constructor && target.constructor.prototype && target.constructor.prototype.hasOwnProperty(vo.prop)) ) {
                        target[name] = this.getInjectedValue(vo, name);
                    }
                }
            }
            if (typeof target.postConstruct === 'function' && !isParent) {
                target.postConstruct();
            }
            return this;
        },

        getInjectedValue: function(vo, name) {
            var val = vo.value;
            var injectee;
            if (vo.cl) {
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

        getValueFromClass: function(cl) {
            for (var name in this.mappings) {
                if (this.mappings.hasOwnProperty(name)) {
                    var vo = this.mappings[name];
                    if (vo.cl === cl) {
                        if (vo.singleton) {
                            if (!vo.value) {
                                vo.value = this.createInstance.apply(this, arguments);
                            }
                            return vo.value;
                        }
                        else {
                            return this.createInstance.apply(this, arguments);
                        }
                    }
                }
            }
            if (this.parent) {
                return this.parent.getValueFromClass.apply(this.parent, arguments);
            } else {
                throw new Error(infuse.errors.NO_MAPPING_FOUND);
            }
        },

        dispose: function() {
            this.mappings = {};
        }

    };

    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {
            var target = this;
            if (typeof target !== 'function') {
                throw new Error('Error, you must bind a function.');
            }
            var args = Array.prototype.slice.call(arguments, 1); // for normal call
            var bound = function () {
                if (this instanceof bound) {
                    var F = function(){};
                    F.prototype = target.prototype;
                    var self = new F();
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
    if (typeof define === 'function' && typeof define.amd !== 'undefined') {
        define("infuse", infuse);
    }

    // export for node.js
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = infuse;
    }
    if (typeof exports !== 'undefined') {
        exports = infuse;
    }

})(this['infuse'] = this['infuse'] || {});
