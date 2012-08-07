# Doc.js usage
1. Document your code using Doc.js comment blocks.
2. Create an HTML file that imports doc.js and runs DOCJS.Generate(["file1.js","file2.js",...]). Add some CSS while you're at it, or use a CSS template.
3. Done. Open your HTML file in your browser and view the result.

## Doc.js comment blocks
Currently only slash-star comment blocks are supported.

### Function

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

### Class

```
/**
 * @class myClass
 * @brief This is a description of the class myClass
 * @param int myConstructorParameter
 * @event eventWithoutDescription
 * @event eventName An event that an instance of the class dispatches.
 */
```

### Method

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

### Property

```
/**
 * @property int myProperty
 * @memberof myClass
 * @brief This is a property in myClass.
 */
```

### Page and MainPage
Use the @mainpage to create the first page in your documentation. The @page command works in the same way, but creates a new separate page in your doc.

```
/**
 * @mainpage My Personal Index Page
 *
 * @section intro_sec Introduction
 * This is the introduction.
 *
 * @section install_sec Installation
 *
 * @subsection step1 Step 1: Opening the box
 * etc...
 */
```

## How it works
* Doc.js loads live source files via AJAX, and produces a neat documentation site by parsing comment blocks.
* Comment blocks are similar to the [Doxygen command specifications](http://www.stack.nl/~dimitri/doxygen/commands.html)
* Doc.js is STUPID. It does not know a thing about the language it is parsing. As long as the input contains comment blocks, Doc.js is happy. Because of this, comment blocks needs to be precise and contain more information than other language-aware documentation softwares needs.

## Todo
* <code>@deprecated</code> and deprecated list
* <code>@todo</code> and todo list
* <code>@author</code> and author lists for all entities
* Restructure to more javascript-specific doc, ```@function```, ```@prototype``` (for classes), ```@this``` (in functions), ```@event``` (for classes)
* Ability to specify <code>@memberof</code> for a piece of code using e.g. <code>@memberOfStart</code> and <code>@memberOfEnd</code>
* <code>@example</code> and <code>@code</code> + <code>@endcode</code>
* Parsing error list, including line numbers and such
* Whenever a known entity is mentioned in ordinary description texts, add link
* <code>@markdown</code> for pages and examples?

## License (the MIT license)

Copyright (c) 2012 Doc.js contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.