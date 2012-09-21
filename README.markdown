# Doc.js
## Example usage
Let's say you have the following javascript code:

```javascript
/**
 * @function add
 * @param float a
 * @param float b
 * @return float
 */
function add(a,b){
  return a+b;
}
```

To make a live doc.js documentation site, add doc.js and this HTML file to a public folder:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="theme.css"/>
  </head>
  </head>
  <body>
    <script src="http://code.jquery.com/jquery.min.js"></script>
    <script src="doc.js"></script>
    <script>
      DOCJS.Generate(["myfile.js"]);
    </script>
  </body>
</html>
```

Now open that HTML file in the browser. Done!

## Commands
Commands are parsed by Doc.js and they are later assembled into things in your documentation. Available commands and their usage are listed below. The ```|``` sign means "or", for example ```@function|fn``` means that ```@function``` is equivalent to ```@fn```. Things in brackets are ```[optional]```.
```
@author authorText
@brief shortDescriptionText
@class className [description]
@description|desc longerDescriptionText
@event eventName [description]
@example exampleText @endExample
@extends className
@function|fn functionName [description]
@library libraryName
@memberof|memberOf className
@method methodName [description]
@page pageName
@param dataType paramName [description]
@property dataType propertyName
@return|returns dataType [description]
@see infoText
@todo [todoText]
@version versionNumber
```

## Comment blocks
Currently slash-star and single-line triple-slash comment blocks are supported:
```
/**
 * Commands go here...
 */
```
```
/// A single command goes here
```

### Command combinations
A comment block has got a set of commands. To document an entity, you must specify a valid set of commands. Using a command may require another command to make a valid block, and there are some optional commands.
```
Command      Requires    Optional 
@class                   @author* @brief @description @event* @extends @param*         @see* @todo* @example
@function                @author* @brief @description                  @param* @return @see* @todo* @example
@library                 @author* @brief @description                                               @version
@method      @memberof   @author* @brief @description                  @param* @return @see* @todo*
@property    @memberof   @author* @brief @description                                  @see* @todo*
* = May be specified more than once in the same block.
```

### Examples
#### Function
```
/**
 * @fn myFunc Description is optional.
 * @brief This is an optional description of myFunc()
 * @description A longer description
 * @param string myParam This is an optional description of myParam
 * @author schteppe
 * @author secondAuthor and contact info here, if you like
 * @return int Optional description of return value. Command begins with datatype.
 */
```

#### Class
Use ```@class``` to describe a class and its constructor.
```
/**
 * @class myClass
 * @brief This is a description of the class myClass
 * @param int myConstructorParameter
 * @event eventWithoutDescription
 * @event eventName An event that an instance of the class dispatches.
 */
```

#### Method
Use ```@method``` to describe a method belonging to a class.
```
/**
 * @method myMethod
 * @memberof myClass
 * @brief This is a method in myClass.
 * @param int param1
 * @param int param2
 * @return float
 */
```
Using single-line comment block (this will not be as informative as the above though):
```
/// @method myMethod
```

#### Property
Use ```@property``` do document a property of your class.
```
/**
 * @property int myProperty
 * @memberof myClass
 * @brief This is a property in myClass.
 */
```
Using single-line comment block (this will not be as informative as the above though):
```
/// @property int myProperty
```

#### Page
Use the ```@page``` to create a page in your documentation.

```
/**
 * @page My Personal Index Page
 * *Everything* but the page command is parsed to be the page content. The page content can be formatted using **Markdown**.
 * ### Markdown it is!
 */
```

## Doc.js is stupid
Doc.js does not know a thing about the language it is parsing. Therefore, it cannot autogenerate documentation from your raw code. Because of this, comment blocks needs to be precise and contain more information than other language-aware documentation systems (e.g. Doxygen).

## Todo
* ```@deprecated``` and deprecated list
* ```@author``` and author lists for all entities
* ```@event``` (for classes)
* Whenever a known entity is mentioned in ordinary description texts, add link

## License (the MIT license)

Copyright (c) 2012 Doc.js contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.