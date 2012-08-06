/**
 * @file doc.js
 * @brief Main JavaScript file
 */

/**
 * @mainpage About
 *
 * @section intro_sec What is Doc.js?
 * Doc.js is a web based on-the-fly documentation generator.
 * 
 * @section install_sec Usage
 * 
 * @subsection step1 Step 1: Document your code
 * Using Doc.js comment blocks.
 * 
 * @subsection step1 Step 2: Create an HTML file
 * Create an HTML file that imports doc.js and runs DOCJS.Generate(["file1.js","file2.js",...]). Add some CSS while you're at it, or use a CSS template.
 *
 * @subsection step1 Step 3: Done
 * Open your HTML file in your browser and view the result.
 *
 * @section contrib_sec Contribute
 * If you like this software, help making it better. Fork the code on https://github.com/schteppe/doc.js
 *
 */

var DOCJS = {};

/**
 * @fn DOCJS.Generate
 * @param Array urls
 * @param Object options
 */
DOCJS.Generate = function(urls,opt){
    // Setup basic page layout
    $("body")
	.html("")
	.append("<article>\
      <nav></nav>\
      <footer>\
	<a href=\"http://github.com/schteppe/doc.js\">github.com/schteppe/doc.js</a>\
      </footer>\
    </article>");

    // Options
    opt = opt || {};
    var options = {
	title:"Hello World!",
	description:"My first Doc.js documentation"
    };
    $.extend(options,opt);
    
    // Set repos header
    $("nav")
	.append("<h1>"+options.title+"</h1>")
	.append("<p>"+options.description+"</p>");

    // Utils
    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    String.prototype.ltrim=function(){return this.replace(/^\s+/,'');}
    String.prototype.rtrim=function(){return this.replace(/\s+$/,'');}
    String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

    // Entities
    var mainpage,
    pages=[],
    classes=[],
    filedesc = [],
    functions=[],
    methods=[],
    properties=[],
    name2class={};

    function Block(src){
	this.src = src;
	this.lineNumber = 1;

	this.author = [];   // @author
	this.brief = [];    // @brief
	this.classs = [];   // @class
	this.desc = [];     // @desc, @description
	this.event = [];    // @event
	this.func = [];     // @fn, @function
	this.memberof = []; // @memberof
	this.method = [];   // @method
	this.page = [];     // @page
	this.param = [];    // @param, @parameter
	this.property = []; // @property
	this.proto = [];    // @proto, @prototype
	this.ret = [];      // @return, @returns
	this.see = [];      // @see
	this.todo = [];     // @todo
    }

    function ErrorReport(filename,lineNumber,message){
	this.lineNumber = lineNumber;
	this.file = filename;
	this.message = message;
    }

    // Parse blocks from a file
    function parseBlocks(src,file){
	var blockObjects = [];
	// Get doc blocks a la doxygen, eg:
	/**
	 * Something like this!
	 */
	// (.(?!\*\/))* is negative lookahead, anything not followed by */
	var blocks = src.match(/\/\*\*\n(^(.(?!\*\/))*\n)+[\n\s\t]*\*\//gm) || [];
	for(var i=0; i<blocks.length; i++){

	    // find line number
	    var idx = src.indexOf(blocks[i]);
	    var lineNumber = (src.substr(0,idx).match(/\n/g)||[]).length + 1;

	    // remove first and last slash-stars
	    blocks[i] = blocks[i]
		.replace(/\/\*\*[\n\t\r]*/,"")
		.replace(/[\n\t\r]*\*\/$/,"");

	    // Remove starting star + spaces
	    var lines = blocks[i].split("\n");
	    for(var j=0; j<lines.length; j++)
		lines[j] = lines[j].replace(/^[\s\t]*\*[\s\t]*/,"");

	    // Create block
	    var block = new Block();
	    block.src = lines.join("\n");
	    block.lineNumber = lineNumber;
	    block.file = file;

	    // Parse one-liners
	    for(var j=0; j<lines.length; j++){
		var line = lines[j];
		if(!line.match(/@/)) continue;

		// @author
		var result = line.match(/@author.*$/);
		if(result){
		    // Check ok
		    block.author.push(result);
		}

		// @brief
		var result = line.match(/@brief.*$/);
		if(result){
		    // Check ok
		    block.author.push(result);
		}

		// @class
		var result = line.match(/@class.*$/);
		if(result){
		    // Check ok
		    block.classs.push(result);
		}

		// @event
		var result = line.match(/@event.*$/);
		if(result){
		    // Check ok
		    block.event.push(result);
		}

		// @function
		var result = line.match(/@function|fn.*$/);
		if(result){
		    // Check ok
		    block.func.push(result);
		}

		// @memberof
		var result = line.match(/@memberof|memberOf.*$/);
		if(result){
		    // Check ok
		    block.memberof.push(result);
		}

		// @method
		var result = line.match(/@method.*$/);
		if(result){
		    // Check ok
		    block.method.push(result);
		}

		// @page
		var result = line.match(/@page.*$/);
		if(result){
		    // Check ok
		    block.page.push(result);
		}

		// @param
		var result = line.match(/@param.*$/);
		if(result){
		    // Check ok
		    block.param.push(result);
		}

		// @property
		var result = line.match(/@property.*$/);
		if(result){
		    // Check ok
		    block.property.push(result);
		}

		// @proto
		var result = line.match(/@prototype|proto.*$/);
		if(result){
		    // Check ok
		    block.proto.push(result);
		}

		// @return
		var result = line.match(/@return|returns.*$/);
		if(result){
		    // Check ok
		    block.ret.push(result);
		}

		// @see
		var result = line.match(/@see.*$/);
		if(result){
		    // Check ok
		    block.see.push(result);
		}

		// @todo
		var result = line.match(/@todo.*$/);
		if(result){
		    // Check ok
		    block.ret.push(result);
		}
	    }

	    // Parse multi-liners
	    // Do line by line?
	    block.desc = block.src.match(/((@description)|(@desc))(.(?!@))*/gm)||[]; // anything but not followed by @
	    
	    blockObjects.push(block);
	} 
	return blockObjects;
    };

    function update(){
	// Register hash for datatypes
	for(var i=0; i<classes.length; i++){
	    name2class[classes[i].name] = classes[i];
	}
	
	// Check for main page
	for(var i=0; i<pages.length; i++){
	    if(pages[i] instanceof DOCJS.MainPage){
		mainpage = pages[i];
		pages.splice(i,1);
	    }
	}

	// Sort
	var sortbyname=function(a,b){
	    if(a.name>b.name) return 1;
	    if(a.name<b.name) return -1;
	    else return 0;
	};
	pages.sort(sortbyname);
	classes.sort(sortbyname);
	functions.sort(sortbyname);
	
	function datatype2link(name){
	    if(name2class[name])
		return "<a href=\"#"+name+"\">"+name+"</a>";
	    else
		return name;
	}
	
	// Main page
	if(mainpage){
	    $("nav")
		.append("<h2>Pages</h2>")
		.append("<ul><li><a href=\"#"+mainpage.name+"\">"+mainpage.name+"</a></li></ul>");
	    $("article")
		.append(
		    $("<section id=\"pages\"><h1>Pages</h1></section>")
			.append("<div id=\""+mainpage.name+"\" class=\"page\">"+mainpage.toHTML()+"</div>")
		);
	}
	
	// Classes
	var $ul = $("<ul></ul>");
	var $details = $("<section id=\"classes\"><h1>Classes</h1></section>");
	for(var j=0; j<classes.length; j++){
	    var args = [], c = classes[j];
	    $class_sec = $("<section id=\""+c.name+"\"></section>");
	    for(var k in c.parameters){
		args.push("<span class=\"datatype\">"+datatype2link(c.parameters[k].type)+"</span>" + " " + c.parameters[k].name);
	    }
	    var sign = c.name;
	    $class_sec
		.append("<h2>"+c.name+"</h2>")
		.append("<p>"+c.brief+"</p>");
	    
	    // Methods
	    var $methods = $("<table></table>").addClass("member_overview");
	    $methods.append("<tr><td class=\"datatype\">&nbsp;</td><td>" + c.name + " ( " + args.join(" , ") + " )</td></tr>");
	    for(var k in methods){
		var m = methods[k];
		if(m.memberof==c.name){
		    
		    var margs = [];
		    for(var k in m.parameters)
			margs.push("<span class=\"datatype\">"+datatype2link(m.parameters[k].type)+"</span>" + " " + m.parameters[k].name);

		    $methods
			.append("<tr><td class=\"datatype\">"+(m.returnvalue ? datatype2link(m.returnvalue.type) : "&nbsp;")+"</td><td>" + m.name + " ( " +margs.join(" , ")+ " )</td></tr>")
			.append("<tr><td></td><td class=\"brief\">"+m.brief+"</td></tr>");
		    
		    if(m.returnvalue && m.returnvalue.type && m.returnvalue.brief)
			$methods.append("<tr><td></td><td class=\"brief\">Returns: "+m.returnvalue.brief+"</td></tr>");
		}
	    }
	    
	    var np=0, $properties = $("<table></table>").addClass("member_overview");
	    for(var k in properties){
		var p = properties[k];
		if(p.memberof==c.name){
		    $properties.append("<tr><td class=\"datatype\">"+(p.type ? datatype2link(p.type) : "&nbsp;")+"</td><td>" + p.name + "</td><td class=\"brief\">"+p.brief+"</td></tr>");
		    np++;
		}
	    }
	    
	    $class_sec
		.append("<h3>Public member functions</h3>")
		.append($methods);
	    if(np){
		$class_sec
		    .append("<h3>Properties</h3>")
		    .append($properties);
	    }

	    $details.append($class_sec);

	    $class = $("<li><a href=\"#"+c.name+"\">"+sign+"</a></li>");
	    if(j==0)
		$ul = $("<ul class=\"class_overview\"></ul>");
	    $ul.append($class);
	}
	$classes = $("<div><h2>Classes</h2></div>")
	    .append($ul);
	$("nav").append($classes);
	$("article").append($details);
	
	// Functions
	var $ul = $("<ul></ul>");
	var $details = $("<section id=\"functions\"><h1>Functions</h1></section>");
	for(var j=0; j<functions.length; j++){
	    var args = [];
	    var f = functions[j];
	    
	    $funsec = $("<section></section>");

	    // Construct signature
	    for(var k in f.parameters){
		var p = f.parameters[k];
		args.push("<span class=\"datatype\">"+datatype2link(p.type)+ "</span> " + p.name);
	    }
	    $funsec.append("<h2 id=\""+f.name+"\"><span class=\"datatype\">"+(f.returnvalue ? datatype2link(f.returnvalue.type) : "") + "</span> " + f.name+" ( "+args.join(" , ")+" )</h2>")
		.append("<p>"+f.brief+"</p>");
	    
	    // Parameter details
	    $params = $("<table></table>");
	    for(var k in f.parameters){
		var p = f.parameters[k];
		$params.append("<tr><th><span class=\"datatype\">"+(p.type ? datatype2link(p.type) : "&nbsp;")+ "</span> <span class=\"param\">" + p.name+"</span></th><td>"+p.brief+"</td></tr>");
	    }
	    $funsec.append($params);
	    $details.append($funsec);
	    
	    /*
	    $class = $("<tr><td class=\"datatype\">"+(f.returnvalue && f.returnvalue.type.length ? datatype2link(f.returnvalue.type) : "&nbsp;")+"</td><td><a href=\"#"+f.name+"\">"+f.name+"</a> ( <span class=\"datatype\">"+args.join("</span> , <span class=\"datatype\">")+"</span> )</td>");
	    if(j==0)
		$ul = $("<table class=\"function_overview\"></table>");
	    $ul.append($class);
	    */

	    // For the nav
	    $fun = $("<li><a href=\"#"+f.name+"\">"+f.name+"</a></li>");
	    if(j==0)
		$ul = $("<ul class=\"function_overview\"></ul>");
	    $ul.append($fun);
	}
	if(functions.length){
	    $("nav")
		.append("<h2>Functions</h2>")
		.append($ul);
	    $("article")
		.append($details);
	}	
    }
    
    // Get the files
    for(var i=0; i<urls.length; i++){
	var file = urls[i];
	$.ajax({
	    url:urls[i],
	    dataType:'text',
	    async:false,
	    success:function(data){
		console.log(parseBlocks(data,file));
		/*
		functions = functions.concat(DOCJS.ParseFunctions(data));
		methods = methods.concat(DOCJS.ParseMethods(data));
		classes = classes.concat(DOCJS.ParseClasses(data));
		properties = properties.concat(DOCJS.ParseProperties(data));
		pages = pages.concat(DOCJS.ParsePages(data));
		*/
	    }
	});
    }
    update();

    function Entity = function(filename){
	this.filename = filename; // where it was defined
    }

    function FileEntity(file,name){
	Entity.call(this,file);
	this.getName = function(){ return name; };
	this.setName = function(n){ name=n; };
	this.name = filename;
	this.brief = "";
    };

    function FunctionEntity(file,name,params,ret){
	Entity.call(this,file);
	this.name = name;
	this.brief = "";
    };
    
    function ClassEntity(file,name,params){
	Entity.call(this,file);
	this.name = name;
	this.brief = "";
    };
    
    function PageEntity(file,name,content){
	Entity.call(this,file);
	this.name = name;
	this.content = content;
    };
    
    
};


/**
 * @fn DOCJS.ParseMethods
 * @author schteppe
 * @param string src
 * @return array An array of parsed DOCJS.Method objects
 */
DOCJS.ParseMethods = function(src){
  var result = [];
  // Get doc blocks a la doxygen
  var blocks = DOCJS.ParseBlocks(src);
  for(i in blocks){
    // Methods have "@memberof" tags to reference their class AND a "@fn" tag for their name
    var fns = blocks[i].match(/\@fn([^@]*)/g);
    var memberofs = blocks[i].match(/\@memberof([^@]*)/g);
    if(memberofs && memberofs.length>=1 && fns && fns.length>=1){
      var m = new DOCJS.Method();
      m.memberof = memberofs[0].replace(/[\s]*@memberof[\s]*/,"").trim();
      m.name = fns[0].replace(/[\s]*@fn[\s]*/,"");
      m.parameters = DOCJS.ParseParameters(blocks[i]);
      m.brief = DOCJS.ParseBrief(blocks[i]);
      m.returnvalue = DOCJS.ParseReturn(blocks[i]);
      result.push(m);
    }
  }
  return result;
};

/**
 * @fn DOCJS.ParsePages
 * @author schteppe
 * @param string src
 * @return array An array of parsed DOCJS.Page objects
 */
DOCJS.ParsePages = function(src){
  var result = [];
  // Get doc blocks a la doxygen
  var blocks = DOCJS.ParseBlocks(src);
  for(i in blocks){
    // Pages got the @page command
    var pages = blocks[i].match(/\@(page|mainpage)([^@]*)/g);
    if(pages && pages.length>=1){
      var p = pages[0].match("main") ? new DOCJS.MainPage() : new DOCJS.Page();
      p.name = "Main page";
      blocks[i].replace(/\@(page|mainpage)[\s]*(.*)/,function(m,$1,$2){ p.name = $2.trim(); return m; });
      p.content = blocks[i].replace(/[\s]*@(page|mainpage).*/,"").trim();
      result.push(p);
    }
  }
  return result;
};

/**
 * @fn DOCJS.ParseClasses
 * @author schteppe
 * @brief Parse source code.
 * @param string src
 * @return array An array of parsed objects
 */
DOCJS.ParseClasses = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = DOCJS.ParseBlocks(src);
  for(i in blocks){

    // Classes have "@class" to define their name
    var classes = blocks[i].match(/\@class([^@]*)/g);
    for(j in classes){
      classes[j] = classes[j]
	.replace(/[\s]*@class[\s]*/,"");
      var s = classes[j];
      var c = new DOCJS.Class();
      c.name = s.trim();
      c.parameters = DOCJS.ParseParameters(blocks[i]);
      c.brief = DOCJS.ParseBrief(blocks[i]);
      result.push(c);
    }
  }
  return result;
};

/**
 * @fn DOCJS.ParseFunctions
 * @author schteppe
 * @param string src
 * @return array An array of parsed objects
 */
DOCJS.ParseFunctions = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = DOCJS.ParseBlocks(src);
  for(i in blocks){
    // functions have "@fn" to define their name
    var functions = blocks[i].match(/\@fn([^@]*)/g);
    var memberofs = blocks[i].match(/\@memberof([^@]*)/g);
    if(functions && !memberofs){
      for(j in functions){
	functions[j] = functions[j]
	  .replace(/[\s]*@fn[\s]*/,"");
	var s = functions[j];
	var c = new DOCJS.Function();
	c.name = s.trim();
	c.parameters = DOCJS.ParseParameters(blocks[i]);
	c.brief = DOCJS.ParseBrief(blocks[i]);
	c.returnvalue = DOCJS.ParseReturn(blocks[i]);
	result.push(c);
      }
    }
  }

  return result;
};

/**
 * @fn DOCJS.ParseParameters
 * @author schteppe
 * @brief Parses parameter data from a string.
 * @param string src Source code to parse from.
 * @return array An array of DOCJS.Parameter objects
 */
DOCJS.ParseParameters = function(src){
  var result = [],
  params = src.match(/@param([^@]*)/g);
  for(j in params){
    params[j] = params[j]
      .replace(/[\s]*@param[\s]*/,"");
    var s = params[j].split(" ",2);
    var param = new DOCJS.Parameter();
    if(s.length==2){
      param.type = s[0].trim();
      param.name = s[1].trim();
    } else if(s.length==1){
      param.type = "";
      param.name = s[0].trim();
    }
    param.brief = params[j].replace(s[0],"").replace(s[1],"").trim();
    result.push(param);
  }
  return result;
};

/**
 * @fn DOCJS.ParseProperties
 * @author schteppe
 * @param string src Source code to parse from.
 * @return array An array of DOCJS.Property objects
 */
DOCJS.ParseProperties = function(src){
  var result = [];

  var blocks = DOCJS.ParseBlocks(src);
  for(i in blocks){
    // Properties have @property and @memberof commands
    var properties = blocks[i].match(/\@property([^\n])*/),
      memberofs = blocks[i].match(/\@memberof([^\n])*/);
    if(properties && memberofs){
      properties[0] = properties[0]
	.replace(/[\s]*@property[\s]*/,"");
      var s = properties[0].split(" ");
      if(s.length<2)
	throw "@property needs two parameters, type and name";
      var property = new DOCJS.Property();
      property.memberof = memberofs[0].replace(/[\s]*@memberof[\s]*/,"").trim();
      property.type = s.shift().trim();
      property.name = s.shift().trim();
      property.brief = DOCJS.ParseBrief(blocks[i]);
      result.push(property);
    }
  }
  return result;
};

/**
 * @fn DOCJS.ParseBrief
 * @author schteppe
 * @brief Parses brief information from a code block
 * @param string src
 * @return string Brief description
 */
DOCJS.ParseBrief = function(src){
  var result = "",
  briefs = src.match(/@brief([^@]*)/g);
  for(j in briefs){
    briefs[j] = briefs[j]
      .replace(/[\s]*@brief[\s]*/,"");
    result += briefs[j].trim();
  }
  return result;
};

/**
 * @fn DOCJS.ParseReturn
 * @author schteppe
 * @brief Parses the information about the return value
 * @param string src
 * @return DOCJS.ReturnValue
 */
DOCJS.ParseReturn = function(src){
  var returns = src.match(/@return([^@]*)/);
  if(returns && returns.length){
    var result = new DOCJS.ReturnValue();
    var r = returns[0].replace(/[\s]*@return[\s]*/,"").trim().split(" ");
    result.type = r.shift();
    result.brief = r.join(" ");
    return result;
  }
};

/**
 * @class DOCJS.Class
 * @author schteppe
 * @brief A representation of a class.
 */
DOCJS.Class = function(){

  /**
   * @property DOCJS.Class parent
   * @memberof DOCJS.Class
   */
  this.parent = null;

  /**
   * @property array methods
   * @memberof DOCJS.Class
   */
  this.methods = [];

  /**
   * @property array properties
   * @memberof DOCJS.Class
   */
  this.properties = [];

  /**
   * @property array parameters
   * @memberof DOCJS.Class
   */
  this.parameters = []; // for constructor

  /**
   * @property string brief
   * @memberof DOCJS.Class
   */
  this.brief = "";
};

/**
 * @brief A representation of a function
 * @author schteppe
 * @class DOCJS.Function
 */
DOCJS.Function = function(){

  /**
   * @property string name
   * @memberof DOCJS.Function
   */
  this.name = "(untitled function)";

  /**
   * @property string brief
   * @memberof DOCJS.Function
   */
  this.brief = "";

  /**
   * @property string description
   * @memberof DOCJS.Function
   */
  this.description = "";

  /**
   * @property array parameters
   * @memberof DOCJS.Function
   */
  this.parameters = [];

  /**
   * @property DOCJS.ReturnValue returnvalue
   * @memberof DOCJS.Function
   */
  this.returnvalue = null;
};

/**
 * @brief A representation of a class method.
 * @author schteppe
 * @class DOCJS.Method
 * @extends DOCJS.Function
 */
DOCJS.Method = function(){

  /**
   * @property string memberof
   * @memberof DOCJS.Method
   */
  this.memberof = "";

  DOCJS.Function.call( this );
};
DOCJS.Method.prototype = new DOCJS.Function();

/**
 * @brief A representation of a class property.
 * @author schteppe
 * @class DOCJS.Property
 */
DOCJS.Property = function(){

  /**
   * @property string type
   * @memberof DOCJS.Property
   */
  this.type = "";

  /**
   * @property string name
   * @memberof DOCJS.Property
   */
  this.name = "";

  /**
   * @property string brief
   * @memberof DOCJS.Property
   */
  this.brief = "";
};

/**
 * @brief A representation of a page.
 * @author schteppe
 * @class DOCJS.Page
 */
DOCJS.Page = function(){

  /**
   * @property string name
   * @memberof DOCJS.Page
   */
  this.name = "";

  /**
   * @property string content
   * @memberof DOCJS.Page
   */
  this.content = "";
};
/**
 * @fn toHTML
 * @memberof DOCJS.Page
 * @brief Returns the page content in HTML format.
 * @return string
 */
DOCJS.Page.prototype.toHTML = function(){
  return (this.content
	  .replace(/\@section\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h1 id=\""+$1+"\">"+$2+"</h1>";})
	  .replace(/\@subsection\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h2 id=\""+$1+"\">"+$2+"</h2>";})
	  );
};

/**
 * @brief A representation of the main page.
 * @author schteppe
 * @class DOCJS.MainPage
 * @extends DOCJS.Page
 */
DOCJS.MainPage = function(){
  DOCJS.Page.call( this );
};
DOCJS.MainPage.prototype = new DOCJS.Page();

/**
 * @class DOCJS.Variable
 * @brief A representation of a variable.
 * @author schteppe
 */
DOCJS.Variable = function(){

  /**
   * @property string type
   * @memberof DOCJS.Variable
   */
  this.type = "";

  /**
   * @property string name
   * @memberof DOCJS.Variable
   */
  this.name = "";

  /**
   * @property string brief
   * @memberof DOCJS.Variable
   */
  this.brief = "";
};

/**
 * @brief A representation of a parameter.
 * @author schteppe
 * @class DOCJS.Parameter
 * @extends DOCJS.Variable
 */
DOCJS.Parameter = function(){
  DOCJS.Variable.call( this );
};
DOCJS.Parameter.prototype = new DOCJS.Variable();

/**
 * @class DOCJS.ReturnValue
 * @brief Represents the return information
 * @extends DOCJS.Variable 
 */
DOCJS.ReturnValue = function(){
  DOCJS.Variable.call( this );
};
DOCJS.ReturnValue.prototype = new DOCJS.Variable();