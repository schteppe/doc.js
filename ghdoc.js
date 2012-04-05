/**
 * @file ghdoc.js
 * @brief Main JavaScript file
 */

/**
 * @mainpage GHDoc
 *
 * @section intro_sec What is GHDoc?
 * GHDoc is a web based on-the-fly documentation viewer for GitHub hosted code.
 * 
 * @section install_sec Usage
 * 
 * @subsection step1 Step 1: Document your code
 * Using GHDoc comment blocks.
 * 
 * @subsection step1 Step 2: Create .ghdoc file
 * Create a file in your repository containing regexps to match the files you want to include. Example content: myFile\.js
 *
 * @subsection step1 Step 3: Done
 * Surf to schteppe.github.com/ghdoc#user/repos/branch and see your doc.
 *
 * @section contrib_sec Contribute
 * If you like this software, help making it better. Fork the code on https://github.com/schteppe/ghdoc
 *
 */

$(function(){

    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    String.prototype.ltrim=function(){return this.replace(/^\s+/,'');}
    String.prototype.rtrim=function(){return this.replace(/\s+$/,'');}
    String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

    // Loaded branches
    var branches = [];

    // Fix ui style
    $("header").addClass("ui-widget-header ui-corner-all ui-helper-clearfix ui-helper-reset");
    $("article").tabs();

    // Default repos
    var username =   "schteppe";
    var repository = "ghdoc";
    var branchname = "master";
    var desc = "A documentation viewer for code hosted on GitHub";

    // Get selected repos
    if(window.location && 
       window.location.hash &&
       window.location.hash.match(/^#.*\/.*$/)){
      var s = window.location.hash.replace("#","").split("/");
      switch(s.length){
      case 3:
	// Username + repos + branch
	username =   s[0];
	repository = s[1];
	branchname = s[2];
	break;
      default:
	alert("Please give url hash on the permitted form, eg user/repos or user/repos/branch");
	break;
      }
      desc = "";
    }

    // Set repos header
    $("header h1").html(username+"/"+repository+"/"+branchname);
    $("header p").html(desc);

    function update(){

      // put all entities from all files in arrays
      var mainpage, pages=[], files=[], classes=[], functions=[], methods=[];
      for(var i=0; i<branches[0].files.length; i++){
	var f = branches[0].files[i];
	// Add file
	files.push(f);

	// Add pages
	for(var j in f.pages){
	  if(f.pages[j] instanceof GHDOC.MainPage)
	    mainpage = f.pages[j];
	  else
	    pages.push(f.pages[j]);
	}

	// Add classes
	for(var j in f.classes)
	  classes.push(f.classes[j]);

	// Add methods
	for(var j in f.methods)
	  methods.push(f.methods[j]);

	// Add functions
	for(var j in f.functions)
	  functions.push(f.functions[j]);
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

      // Main page
      if(!mainpage)
	$("#overview")
	  .html("<h1>Main page</h1>")
	  .append("<p>This page is not written yet. Carry on!</p>");
      else
	$("#overview")
	  .html("<h1>"+mainpage.name+"</h1>")
	  .append(mainpage.toHTML());

      // Files
      var $ul = $("<ul></ul>");
      for(var i=0; i<files.length; i++){
	var f = files[i];
	$ul.append("<li><a href=\"https://github.com/"+username+"/"+repository+"/blob/"+branchname+"/"+f.name+"\">"+f.name+"</a> "+f.brief+"</li>");
      }
      $("#files")
	.html("<h1>Files</h1>")
	.append($ul);

      // Classes
      var $ul = $("<ul class=\"class_overview\"></ul>");
      var $details = $("<div></div>");
      for(var j=0; j<classes.length; j++){
	var args = [], c = classes[j];
	for(var k in c.parameters){
	  args.push("<span class=\"datatype\">"+c.parameters[k].type+"</span>" + " " + c.parameters[k].name);
	}
	var sign = c.name;
	$details.append("<h2 id=\""+c.name+"\">"+c.name+"</h2>")
	  .append("<p>"+c.brief+"</p>")
	  .append("<h3>Public member functions</h3>");
	var $methods = $("<ul></ul>").addClass("member_overview");
	$methods.append("<li><label class=\"datatype\">&nbsp;</label>" + c.name + " ( " + args.join(" , ") + " )</li>");
	for(var k in methods){
	  var m = methods[k];
	  if(m.memberof==c.name)
	    $methods.append("<li><label class=\"datatype\">"+(m.returnvalue ? m.returnvalue.type : "&nbsp;")+"</label>" + m.name + " ( " + " )</li>");
	}
	$details.append($methods);
	$class = $("<li><a href=\"#"+c.name+"\">"+sign+"</a></li>");
	$ul.append($class);
      }
      $("#classes")
	.html("<h1>Classes</h1>")
	//.append("<div id=\"chart\"></div>")
	.append($ul)
	.append($details);

      // d3.js
      var w = 900,h = 170;
      var cluster = d3.layout.cluster()
	.size([h, w - 160]);
      var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });
      var vis = d3.select("#chart").append("svg")
	.attr("width", w)
	.attr("height", h)
	.append("g")
	.attr("transform", "translate(70, 0)");
      var data = {
	"name": "BaseClass",
	"children": [
      {
        "name": "SubClass",
        "children": [
      {
	"name": "SubSubClass",
	"children": [
      {"name": "SubSubSubClass1", "size": 3938},
      {"name": "SubSubSubClass2", "size": 3812},
      {"name": "SubSubSubClass2", "size": 6714},
      {"name": "SubSubSubClass3", "size": 743}
		     ]
      }
		     ]
      }
		     ]
      };
      var nodes = cluster.nodes(data);
      var link = vis.selectAll("path.link")
	.data(cluster.links(nodes))
	.enter().append("path")
	.attr("class", "link")
	.attr("d", diagonal);
      var node = vis.selectAll("g.node")
	.data(nodes)
	.enter().append("g")
	.attr("class", "node")
	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	node.append("circle")
	.attr("r", 4.5);
      node.append("text")
	.attr("dx", function(d) { return d.children ? -8 : 8; })
	.attr("dy", 3)
	.attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
	.text(function(d) { return d.name; });

      // Functions
      var $ul = $("<ul class=\"function_overview\"></ul>");
      var $details = $("<div></div>");
      for(var j=0; j<functions.length; j++){
	var args = [];
	var f = functions[j];

	// Construct signature
	for(var k in f.parameters){
	  var p = f.parameters[k];
	  args.push("<span class=\"datatype\">"+p.type+ "</span> " + p.name);
	}
	$details.append("<h2 id=\""+f.name+"\"><span class=\"datatype\">"+(f.returnvalue ? f.returnvalue.type : "") + "</span> " + f.name+" ( "+args.join(" , ")+" )</h2>")
	  .append("<p>"+f.brief+"</p>");

	// Parameter details
	for(var k in f.parameters){
	  var p = f.parameters[k];
	  $details.append("<h4>"+(p.type ? "<span class=\"datatype\">"+p.type+ "</span>" : "")+ " " + p.name+"</h4><p>"+p.brief+"</p>");
	}

	$class = $("<li><label class=\"datatype\" for=\""+f.name+"\">"+(f.returnvalue && f.returnvalue.type.length ? f.returnvalue.type : "&nbsp;")+"</label><a href=\"#"+f.name+"\">"+f.name+"</a> ( <span class=\"datatype\">"+args.join("</span> , <span class=\"datatype\">")+"</span> )</li>");
	$ul.append($class);
      }
      $("#functions")
	.html("<h1>Functions</h1>")
	.append($ul)
	.append($details);
    }

    // Get the file tree
    $.ajax({
	url:"http://github.com/api/v2/json/repos/show/"+username+"/"+repository+"/branches",
	dataType:'jsonp',
	success:function(data){
	  // Loop through branches
	  for(branch in data.branches){
	    if(branch==branchname){
	      var t = new GHDOC.Tree(username,repository, data.branches[branch], branch, update);
	      branches.push(t);
	    }
	  }
	  update();
	}
      });
  });

var GHDOC = {};

/**
 * @class GHDOC.File
 * @author schteppe
 * @param string user
 * @param string repos
 * @param string branch
 * @param string filename
 * @param array options
 */
GHDOC.File = function(user,repos,branch,filename,options){
  // Extend options
  options = options || {};
  var opt = {
    success:function(){},
    async:true
  };
  $.extend(opt,options);

  /**
   * @property name
   * @memberof GHDOC.File
   */
  this.name = filename;

  /**
   * @property classes
   * @memberof GHDOC.File
   */
  this.classes = [];
  this.methods = [];
  this.functions = [];
  this.pages = [];
  this.content = null;
  this.returntype = "";
  this.brief = "";

  // Get file contents
  var that = this;
  var url = "https://github.com/api/v2/json/blob/show/"+user+"/"+repos+"/"+branch+"/"+filename;
  $.ajax({
      url:url,
      dataType:'jsonp',
      success:function(data){
	that.content = data.blob.data;
	that.functions = that.functions.concat(GHDOC.ParseFunctions(data.blob.data));
	that.methods = that.methods.concat(GHDOC.ParseMethods(data.blob.data));
	that.classes = that.classes.concat(GHDOC.ParseClasses(data.blob.data));
	that.pages = that.pages.concat(GHDOC.ParsePages(data.blob.data));
	opt.success();
      }
    });
};

/**
 * @class GHDOC.Tree
 * @author schteppe
 * @param string user
 * @param string repos
 * @param string branch
 * @param string name
 */
GHDOC.Tree = function(user,repos,branch,name,success){
  success = success || function(){};
  this.patterns = [];
  this.ghdocfile = null;
  this.name = name || "Untitled branch";
  this.files = [];
  var that = this;

  function matches(filename){
    for(var i in that.patterns)
      if(that.patterns[i].length && filename.match(that.patterns[i])) return true;
    return false;
  }

  $.ajax({
      url:"http://github.com/api/v2/json/tree/show/"+user+"/"+repos+"/"+branch,
      dataType:'jsonp',
      success:function(data){

	// Find .ghdoc file
	var useghdocfile = false;
	for(var i in data.tree){
	  if(data.tree[i].type=="blob" && data.tree[i].name.match(/^\.ghdoc$/)){
	    useghdocfile = true;
	    that.ghdocfile = new GHDOC.File(user,repos,branch,data.tree[i].name,{success:function(){
		  // Save found patterns
		  if(that.ghdocfile.content){
		    var lines = that.ghdocfile.content.split("\n");
		    for(var j in lines){
		      if(lines[j][0]!='#')
			that.patterns.push(lines[j]);
		    }
		  }

		  // Loop through files
		  for(var i in data.tree){
		    if(data.tree[i].type=="blob" && matches(data.tree[i].name)){
		      that.files.push(new GHDOC.File(user,repos,branch,data.tree[i].name,{success:success}));
		    }
		    // @todo sub branch
		  }
		  success();
		}
	      });
	  }
	}
      }
    });
};

/**
 * @fn GHDOC.ParseBlocks
 * @author schteppe
 * @brief Parse documentation blocks.
 * @param string src Source code to parse.
 */
GHDOC.ParseBlocks = function(src){
  // Get doc blocks a la doxygen
  // (.(?!\*\/))* is negative lookahead, anything not followed by */
  var blocks = src.match(/^[\s\t]*\/\*\*\n(^(.(?!\*\/))*\n)+[\n\s\t]*\*\//gm) || [];//match(/\/\*\*([.\n\s\t\r\w*\@:\.\?\!\-_\d#]*)\*\//gm) || [];
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
      p.name = pages[0].replace(/[\s]*@(page|mainpage)[\s]*/,"").trim();
      p.content = blocks[i].replace(/[\s]*@(page|mainpage)[\s]*.*/,"").trim();
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
    param.type = s[0].trim();
    param.name = s[1].trim();
    param.brief = params[j].replace(s[0],"").replace(s[1],"").trim();
    result.push(param);
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
    var r = returns[j].replace(/[\s]*@return[\s]*/,"").trim();
    result.type = r.substr(0,r.indexOf(" "));
    result.name = r.substr(r.indexOf(" "));
    result.name = result.name.substr(0,result.name.indexOf(" "));
    result.brief = "";
    return result;
  }
};

/**
 * @class GHDOC.Class
 * @author schteppe
 * @brief A representation of a class.
 */
GHDOC.Class = function(){
  this.parent = null;
  this.methods = [];
  this.properties = [];
  this.parameters = []; // for constructor
  this.brief = "";
};

/**
 * @brief A representation of a function
 * @author schteppe
 * @class GHDOC.Function
 */
GHDOC.Function = function(){
  this.name = "(untitled function)";
  this.brief = "";
  this.description = "";
  this.parameters = [];
  this.returnvalue = null;
};

/**
 * @brief A representation of a class method.
 * @author schteppe
 * @class GHDOC.Method
 * @extends GHDOC.Function
 */
GHDOC.Method = function(){
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
  this.type = "";
  this.name = "";
  this.brief = "";
};

/**
 * @brief A representation of a page.
 * @author schteppe
 * @class GHDOC.Page
 */
GHDOC.Page = function(){
  this.name = "";
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
	  .replace(/\@section\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h2 id=\""+$1+"\">"+$2+"</h2>";})
	  .replace(/\@subsection\s+([\w_]+)\s+([^\n]+)/gm,function(m,$1,$2){return "<h3 id=\""+$1+"\">"+$2+"</h3>";})
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
  this.type = "";
  this.name = "";
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