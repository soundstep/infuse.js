;(function(utils, undefined) {

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

})(this['utils'] = this['utils'] || {});