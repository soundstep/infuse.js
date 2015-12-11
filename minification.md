## Solution to minification with dependency injection

#### Current syntax

**Constructor injection**

```
function Model(dependencyA, dependencyB) {

}
```
**Property injection**

```
function Model() {
	this.dependencyA = null;
	this.dependencyB = null;
}
```
#### The problem

Minification will mangle the variable and break the injection, the following code:

```
function Model(dependencyA, dependencyB) {

}
```
Will be updated to:

```
function Model(a,b){}
```
#### Solutions

**The mangling option in uglify.js**

Using the ```--no-mangle``` option uglify will solve the problem, but the code will not as minified as it could.

A list of injection names can be kept updated so that it doesn't get mangled. See this [example](https://github.com/soundstep/soma-template/blob/master/GruntFile.js#L42) with grunt.

More info [on the soma.js group](https://groups.google.com/forum/#!topic/somajs/twPrU9_wLhQ), and on the [grunt-contrib-uglify readme](https://github.com/gruntjs/grunt-contrib-uglify#reserved-identifiers).

The downside is having to maintain this list.

**A property holding the injection names**

Using a ```deps``` or ```inject``` property to the injection names to inject.

```
function Model(dependencyA, dependencyB) {

}
Model.deps = ['dependencyA', 'dependencyB'];
```

**The array syntax**

Instead of sending function to instantion, an array describing both the injection names and the function itself is used.

Common syntax:

```
injector.createInstance(function(dependencyA, dependencyB) {
	
});
```

Syntax with array:

```
injector.createInstance(['dependencyA', 'dependencyB', function(dependencyA, dependencyB) {
	
}]);

```

**A pre-processor**

A tool can be created to modify source files, such as [ng-annotate](https://github.com/olov/ng-annotate) for Angular.

The tool would parse and modify source code to one the syntax (array or property).

This solution might not apply due to the diversity of the syntax you can use with sweep.js.



