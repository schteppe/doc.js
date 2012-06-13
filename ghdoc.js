/**
 * @file ghdoc.js
 * @brief Main JavaScript file
 */

/**
 * @mainpage GHDoc
 *
 * @section intro_sec What is GHDoc?
 * GHDoc is a web based on-the-fly documentation generator.
 * 
 * @section install_sec Usage
 * 
 * @subsection step1 Step 1: Document your code
 * Using GHDoc comment blocks.
 * 
 * @subsection step1 Step 2: Create an HTML file
 * Create an HTML file that imports ghdoc.js and runs GHDOC.Generate(["file1.js","file2.js",...]). Add some CSS while you're at it, or use a CSS template.
 *
 * @subsection step1 Step 3: Done
 * Open your HTML file in your browser and view the result.
 *
 * @section contrib_sec Contribute
 * If you like this software, help making it better. Fork the code on https://github.com/schteppe/ghdoc
 *
 */

var GHDOC = {};

GHDOC.Generate = function(urls,opt){
    $("body").append("<article>\
      <nav></nav>\
      <footer>\
	<a href=\"http://github.com/schteppe/ghdoc\">github.com/schteppe/ghdoc</a>\
      </footer>\
    </article>");

    opt = opt || {};
    var options = {
	title:"Hello World!",
	description:"My first GHDoc documentation"
    };
    $.extend(options,opt);

    // Utils
    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    String.prototype.ltrim=function(){return this.replace(/^\s+/,'');}
    String.prototype.rtrim=function(){return this.replace(/\s+$/,'');}
    String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

    var mainpage,
    pages=[],
    classes=[],
    filedesc = [],
    functions=[],
    methods=[],
    properties=[],
    name2class={};
    
    // Set repos header
    $("nav")
	.append("<h1>"+options.title+"</h1>")
	.append("<p>"+options.description+"</p>");

    function update(){
	
	// Register hash for datatypes
	for(var i in classes){
	    name2class[classes[i].name] = classes[i];
	}
	
	// Check for main page
	for(var i in pages){
	    if(pages[i] instanceof GHDOC.MainPage){
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
    GHDOC.update = update;
    
    // Get the files
    for(var i=0; i<urls.length; i++){
	$.ajax({
	    url:urls[i],
	    dataType:'text',
	    success:function(data){
		functions = functions.concat(GHDOC.ParseFunctions(data));
		methods = methods.concat(GHDOC.ParseMethods(data));
		classes = classes.concat(GHDOC.ParseClasses(data));
		properties = properties.concat(GHDOC.ParseProperties(data));
		pages = pages.concat(GHDOC.ParsePages(data));
		update();
	    }
	});
    }
};

/**
 * @class GHDOC.File
 * @brief A file
 * @author schteppe
 * @param string user
 * @param string repos
 * @param string branch
 * @param string filename
 * @param array options
 */
GHDOC.File = function(filename,content,options){
  // Extend options
  options = options || {};
  var opt = {
    success:function(){},
    async:true
  };
  $.extend(opt,options);

  /**
   * @property string name
   * @brief The file name
   * @memberof GHDOC.File
   */
  this.name = filename;

  /**
   * @property array classes
   * @brief Classes found in the file
   * @memberof GHDOC.File
   */
  this.classes = [];

  /**
   * @property array methods
   * @brief Methods found in the file
   * @memberof GHDOC.File
   */
  this.methods = [];

  /**
   * @property array functions
   * @brief Functions found in the file
   * @memberof GHDOC.File
   */
  this.functions = [];

  /**
   * @property array pages
   * @brief Pages found in the file
   * @memberof GHDOC.File
   */
  this.pages = [];

  /**
   * @property array properties
   * @memberof GHDOC.File
   */
  this.properties = [];

  /**
   * @property string content
   * @memberof GHDOC.File
   */
  this.content = null;

  /**
   * @property string brief
   * @memberof GHDOC.File
   */
  this.brief = "";

    // Get file contents
    /*
    opt.success();
    GHDOC.update();
    */
};

/**
 * @fn GHDOC.ParseBlocks
 * @author schteppe
 * @brief Parse documentation blocks.
 * @param string src Source code to parse.
 * @return array
 */
GHDOC.ParseBlocks = function(src){
  // Get doc blocks a la doxygen
  // (.(?!\*\/))* is negative lookahead, anything not followed by */
  var blocks = src.match(/[\s\t]*\/\*\*\n(^(.(?!\*\/))*\n)+[\n\s\t]*\*\//gm) || [];//match(/\/\*\*([.\n\s\t\r\w*\@:\.\?\!\-_\d#]*)\*\//gm) || [];
  for(i in blocks){
    // trim
    blocks[i] = blocks[i]
      .replace(/\/\*\*[\n\t\r]*/,"")
      .replace(/[\n\t\r]*\*\/$/,"");
    var lines = blocks[i].split("\n");
    for(j in lines)
      lines[j] = lines[j].replace(/^[\s\t]*\*[\s\t]*/,"");
    blocks[i] = lines.join("\n");
  } 
  return blocks;
};

/**
 * @fn GHDOC.ParseMethods
 * @author schteppe
 * @param string src
 * @return array An array of parsed GHDOC.Method objects
 */
GHDOC.ParseMethods = function(src){
  var result = [];
  // Get doc blocks a la doxygen
  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){
    // Methods have "@memberof" tags to reference their class AND a "@fn" tag for their name
    var fns = blocks[i].match(/\@fn([^@]*)/g);
    var memberofs = blocks[i].match(/\@memberof([^@]*)/g);
    if(memberofs && memberofs.length>=1 && fns && fns.length>=1){
      var m = new GHDOC.Method();
      m.memberof = memberofs[0].replace(/[\s]*@memberof[\s]*/,"").trim();
      m.name = fns[0].replace(/[\s]*@fn[\s]*/,"");
      m.parameters = GHDOC.ParseParameters(blocks[i]);
      m.brief = GHDOC.ParseBrief(blocks[i]);
      m.returnvalue = GHDOC.ParseReturn(blocks[i]);
      result.push(m);
    }
  }
  return result;
};

/**
 * @fn GHDOC.ParsePages
 * @author schteppe
 * @param string src
 * @return array An array of parsed GHDOC.Page objects
 */
GHDOC.ParsePages = function(src){
  var result = [];
  // Get doc blocks a la doxygen
  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){
    // Pages got the @page command
    var pages = blocks[i].match(/\@(page|mainpage)([^@]*)/g);
    if(pages && pages.length>=1){
      var p = pages[0].match("main") ? new GHDOC.MainPage() : new GHDOC.Page();
      p.name = "Main page";
      blocks[i].replace(/\@(page|mainpage)[\s]*(.*)/,function(m,$1,$2){ p.name = $2.trim(); return m; });
      p.content = blocks[i].replace(/[\s]*@(page|mainpage).*/,"").trim();
      result.push(p);
    }
  }
  return result;
};

/**
 * @fn GHDOC.ParseClasses
 * @author schteppe
 * @brief Parse source code.
 * @param string src
 * @return array An array of parsed objects
 */
GHDOC.ParseClasses = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){

    // Classes have "@class" to define their name
    var classes = blocks[i].match(/\@class([^@]*)/g);
    for(j in classes){
      classes[j] = classes[j]
	.replace(/[\s]*@class[\s]*/,"");
      var s = classes[j];
      var c = new GHDOC.Class();
      c.name = s.trim();
      c.parameters = GHDOC.ParseParameters(blocks[i]);
      c.brief = GHDOC.ParseBrief(blocks[i]);
      result.push(c);
    }
  }
  return result;
};

/**
 * @fn GHDOC.ParseFunctions
 * @author schteppe
 * @param string src
 * @return array An array of parsed objects
 */
GHDOC.ParseFunctions = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){
    // functions have "@fn" to define their name
    var functions = blocks[i].match(/\@fn([^@]*)/g);
    var memberofs = blocks[i].match(/\@memberof([^@]*)/g);
    if(functions && !memberofs){
      for(j in functions){
	functions[j] = functions[j]
	  .replace(/[\s]*@fn[\s]*/,"");
	var s = functions[j];
	var c = new GHDOC.Function();
	c.name = s.trim();
	c.parameters = GHDOC.ParseParameters(blocks[i]);
	c.brief = GHDOC.ParseBrief(blocks[i]);
	c.returnvalue = GHDOC.ParseReturn(blocks[i]);
	result.push(c);
      }
    }
  }

  return result;
};

/**
 * @fn GHDOC.ParseParameters
 * @author schteppe
 * @brief Parses parameter data from a string.
 * @param string src Source code to parse from.
 * @return array An array of GHDOC.Parameter objects
 */
GHDOC.ParseParameters = function(src){
  var result = [],
  params = src.match(/@param([^@]*)/g);
  for(j in params){
    params[j] = params[j]
      .replace(/[\s]*@param[\s]*/,"");
    var s = params[j].split(" ",2);
    var param = new GHDOC.Parameter();
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
 * @fn GHDOC.ParseProperties
 * @author schteppe
 * @param string src Source code to parse from.
 * @return array An array of GHDOC.Property objects
 */
GHDOC.ParseProperties = function(src){
  var result = [];

  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){
    // Properties have @property and @memberof commands
    var properties = blocks[i].match(/\@property([^\n])*/),
      memberofs = blocks[i].match(/\@memberof([^\n])*/);
    if(properties && memberofs){
      properties[0] = properties[0]
	.replace(/[\s]*@property[\s]*/,"");
      var s = properties[0].split(" ");
      if(s.length<2)
	throw "@param needs two parameters, type and name";
      var property = new GHDOC.Property();
      property.memberof = memberofs[0].replace(/[\s]*@memberof[\s]*/,"").trim();
      property.type = s.shift().trim();
      property.name = s.shift().trim();
      property.brief = GHDOC.ParseBrief(blocks[i]);
      result.push(property);
    }
  }
  return result;
};

/**
 * @fn GHDOC.ParseBrief
 * @author schteppe
 * @brief Parses brief information from a code block
 * @param string src
 * @return string Brief description
 */
GHDOC.ParseBrief = function(src){
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
 * @fn GHDOC.ParseReturn
 * @author schteppe
 * @brief Parses the information about the return value
 * @param string src
 * @return GHDOC.ReturnValue
 */
GHDOC.ParseReturn = function(src){
  var returns = src.match(/@return([^@]*)/);
  if(returns && returns.length){
    var result = new GHDOC.ReturnValue();
    var r = returns[0].replace(/[\s]*@return[\s]*/,"").trim().split(" ");
    result.type = r.shift();
    result.brief = r.join(" ");
    return result;
  }
};

/**
 * @class GHDOC.Class
 * @author schteppe
 * @brief A representation of a class.
 */
GHDOC.Class = function(){

  /**
   * @property GHDOC.Class parent
   * @memberof GHDOC.Class
   */
  this.parent = null;

  /**
   * @property array methods
   * @memberof GHDOC.Class
   */
  this.methods = [];

  /**
   * @property array properties
   * @memberof GHDOC.Class
   */
  this.properties = [];

  /**
   * @property array parameters
   * @memberof GHDOC.Class
   */
  this.parameters = []; // for constructor

  /**
   * @property string brief
   * @memberof GHDOC.Class
   */
  this.brief = "";
};

/**
 * @brief A representation of a function
 * @author schteppe
 * @class GHDOC.Function
 */
GHDOC.Function = function(){

  /**
   * @property string name
   * @memberof GHDOC.Function
   */
  this.name = "(untitled function)";

  /**
   * @property string brief
   * @memberof GHDOC.Function
   */
  this.brief = "";

  /**
   * @property string description
   * @memberof GHDOC.Function
   */
  this.description = "";

  /**
   * @property array parameters
   * @memberof GHDOC.Function
   */
  this.parameters = [];

  /**
   * @property GHDOC.ReturnValue returnvalue
   * @memberof GHDOC.Function
   */
  this.returnvalue = null;
};

/**
 * @brief A representation of a class method.
 * @author schteppe
 * @class GHDOC.Method
 * @extends GHDOC.Function
 */
GHDOC.Method = function(){

  /**
   * @property string memberof
   * @memberof GHDOC.Method
   */
  this.memberof = "";

  GHDOC.Function.call( this );
};
GHDOC.Method.prototype = new GHDOC.Function();

/**
 * @brief A representation of a class property.
 * @author schteppe
 * @class GHDOC.Property
 */
GHDOC.Property = function(){

  /**
   * @property string type
   * @memberof GHDOC.Property
   */
  this.type = "";

  /**
   * @property string name
   * @memberof GHDOC.Property
   */
  this.name = "";

  /**
   * @property string brief
   * @memberof GHDOC.Property
   */
  this.brief = "";
};

/**
 * @brief A representation of a page.
 * @author schteppe
 * @class GHDOC.Page
 */
GHDOC.Page = function(){

  /**
   * @property string name
   * @memberof GHDOC.Page
   */
  this.name = "";

  /**
   * @property string content
   * @memberof GHDOC.Page
   */
  this.content = "";
};
/**
 * @fn toHTML
 * @memberof GHDOC.Page
 * @brief Returns the page content in HTML format.
 * @return string
 */
GHDOC.Page.prototype.toHTML = function(){
  return (this.content
	  .replace(/\@section\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h1 id=\""+$1+"\">"+$2+"</h1>";})
	  .replace(/\@subsection\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h2 id=\""+$1+"\">"+$2+"</h2>";})
	  );
};

/**
 * @brief A representation of the main page.
 * @author schteppe
 * @class GHDOC.MainPage
 * @extends GHDOC.Page
 */
GHDOC.MainPage = function(){
  GHDOC.Page.call( this );
};
GHDOC.MainPage.prototype = new GHDOC.Page();

/**
 * @class GHDOC.Variable
 * @brief A representation of a variable.
 * @author schteppe
 */
GHDOC.Variable = function(){

  /**
   * @property string type
   * @memberof GHDOC.Variable
   */
  this.type = "";

  /**
   * @property string name
   * @memberof GHDOC.Variable
   */
  this.name = "";

  /**
   * @property string brief
   * @memberof GHDOC.Variable
   */
  this.brief = "";
};

/**
 * @brief A representation of a parameter.
 * @author schteppe
 * @class GHDOC.Parameter
 * @extends GHDOC.Variable
 */
GHDOC.Parameter = function(){
  GHDOC.Variable.call( this );
};
GHDOC.Parameter.prototype = new GHDOC.Variable();

/**
 * @class GHDOC.ReturnValue
 * @brief Represents the return information
 * @extends GHDOC.Variable 
 */
GHDOC.ReturnValue = function(){
  GHDOC.Variable.call( this );
};
GHDOC.ReturnValue.prototype = new GHDOC.Variable();