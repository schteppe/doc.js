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

    // A comment block in the code.
    function Block(src){
	this.src = src;
	var lines;
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

	var parsedLines = [];
	this.markLineAsParsed = function(lineNumber){
	    if(!that.lineIsParsed(lineNumber))
		parsedLines.push(lineNumber);
	};
	this.lineIsParsed = function(lineNumber){
	    return parsedLines.indexOf(lineNumber)!=-1;
	};
	this.getLine = function(lineNumber){
	    if(!lines) lines = src.split("\n");
	    return lines[lineNumber];
	};
	this.getUnparsedLines = function(){
	    throw new Error("todo");
	};
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

    // An Entity is a set of Command's
    // The Entities corresponds to a thing that is viewed to the user, eg. Function, Class etc.
    function Entity(filename){
	this.filename = filename; // where it was defined
    }

    function FileEntity(file,name){
	Entity.call(this,file);
	this.getName = function(){ return name; };
	this.setName = function(n){ name=n; };
	this.name = filename;
	this.brief = "";
    }

    function FunctionEntity(file,name,params,ret){
	Entity.call(this,file);
	this.name = name;
	this.brief = "";
    }
    
    function ClassEntity(file,name,params){
	Entity.call(this,file);
	this.name = name;
	this.brief = "";
    }
    
    function PageEntity(file,name,content){
	Entity.call(this,file);
	this.name = name;
	this.content = content;
    }

    // A parsed command
    function Command(block){
	this.getBlock = function(){ return block; };
	this.setBlock = function(b){ block = b; };
    }

    function ParamCommand(block,dataType,name){
	Command.call(this,block);
	this.getName = function(){ return name; };
	this.setName = function(n){ name=n; };
	this.getDataType = function(){ return dataType; };
	this.setDataType = function(n){ dataType=n; };
    }
    ParamCommand.parse = function(block){
	// Parse block, return array of ParamCommand 
	return []; // todo
    }

    function AuthorCommand(block,name,email){
	Command.call(this,block);
	this.getName = function(){ return name; };
	this.setName = function(n){ name=n; };
	this.getEmail = function(){ return email; };
	this.setEmail = function(n){ email=n; };
    }

    function ReturnCommand(block,dataType,name){
	Command.call(this,block);
	this.getName = function(){ return name; };
	this.setName = function(n){ name=n; };
	this.getDataType = function(){ return dataType; };
	this.setDataType = function(n){ dataType=n; };
    }
};

