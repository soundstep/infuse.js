/*
Copyright (c) | 2014 | infuse.js | Philip Bulley | @milkisevil

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
interface Infuse
{
  Injector():void
  getConstructorParams( clazz ):string[]
}

interface Injector
{
  createChild():Injector
  getMappingVo( prop:string ):MappingVO
  mapValue( prop:string, val:any ):Injector
  mapClass( prop:string, clazz:Function, singleton?:boolean ):Injector
  removeMapping( prop:string ):Injector
  hasMapping( prop:string ):boolean
  hasInheritedMapping( prop:string ):boolean
  getMapping( value:any ):string
  getValue( prop:string ):any
  getClass( prop:string ):Function
  instantiate( TargetClass:Function ):any
  inject( target:any, isParent:boolean ):Injector
  getInjectedValue( vo:MappingVO, name:string ):any
  createInstance( ...rest:any[] ):any
  getValueFromClass( clazz:Function ):any
  dispose():void
}

interface MappingVO
{
  prop:string;
  value:any;
  cl:Function;
  singleton:any;
}

declare var infuse:Infuse;