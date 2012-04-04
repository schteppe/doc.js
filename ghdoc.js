/**
 * Doxygen documentation generator for Github repositories
 * @see http://www.stack.nl/~dimitri/doxygen/commands.html
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
    var desc = "A documentation generator for GitHub hosted projects";

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

      // Overview
      $("#overview")
	.html("<h1>Overview</h1>")
	.append("<p>@todo</p>");

      // Files
      var $ul = $("<ul></ul>");
      for(var i=0; i<branches[0].files.length; i++)
	$ul.append("<li>"+branches[0].files[i].name+"</li>");
      $("#files")
	.html("<h1>Files</h1>")
	.append($ul);

      // Classes
      var $ul = $("<ul></ul>");
      for(var i=0; i<branches[0].files.length; i++){
	var file = branches[0].files[i];
	for(var j=0; j<file.classes.length; j++){
	  var args = [];
	  for(var k in file.classes[j].parameters)
	    args.push("<i>"+file.classes[j].parameters[k].type+"</i>" + " " + file.classes[j].parameters[k].name);
	  $class = $("<li>"+file.classes[j].name+" ( "+args.join(" , ")+" ) </li>");
	  $sub = $("<ul></ul>");
	  for(var k in file.classes[j].methods.length)
	    $sub.append("<li>"+file.classes[j].methods[k].name+"</li>");
	  $class.append($sub);
	  $ul.append($class);
	}
      }
      $("#classes")
	.html("<h1>Classes</h1>")
	.append($ul);

      // Functions
      $("#functions")
	.html("<h1>Functions</h1>")
	.append("<p>@todo</p>");
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
 * @param string user
 * @param string repos
 * @param string branch
 * @param string filename
 */
GHDOC.File = function(user,repos,branch,filename,options){
  // Extend options
  options = options || {};
  var opt = {
    success:function(){},
    async:true
  };
  $.extend(opt,options);

  this.name = filename;
  this.classes = [];
  this.methods = [];
  this.functions = [];
  this.content = null;

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
	opt.success();
      }
    });
};

/**
 * @class GHDOC.Tree
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
 * @brief Parse documentation blocks.
 * @param string src
 */
GHDOC.ParseBlocks = function(src){
  // Get doc blocks a la doxygen
  var blocks = src.match(/\/\*\*([.\n\s\t\r\w*@]*)\*\//gm) || [];
  for(i in blocks){
    // trim
    blocks[i] = blocks[i]
      .replace(/^\/\*\*[\n\t\r]*/,"")
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
 * @param string src
 * @return array An array of parsed GHDOC.Method objects
 */
GHDOC.ParseMethods = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = GHDOC.ParseBlocks(src);
  for(i in blocks){
    // Methods have "@memberof" tags to reference their class
    var methods = blocks[i].match(/\@memberof([^@]*)/g);
    for(j in methods){
      methods[j] = methods[j]
	.replace(/[\s]*@memberof[\s]*/,"");
      var s = methods[j];
      var m = new GHDOC.Method();
      m.memberof = s;
      m.parameters = GHDOC.ParseParameters(blocks[i]);
      result.push(m);
    }
  }

  return result;
};

/**
 * @fn GHDOC.ParseClasses
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
      result.push(c);
    }
  }
  return result;
};

/**
 * @fn GHDOC.ParseFunctions
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
      result.push(c);
    }
  }

  return result;
};

/**
 * @fn GHDOC.ParseParameters
 * @brief Parses parameter data from a string.
 * @param string src
 * @return array An array of GHDOC.Parameter objects
 */
GHDOC.ParseParameters = function(src){
  var result = [],
  params = src.match(/@param([^@]*)/g);
  for(j in params){
    params[j] = params[j]
      .replace(/[\s]*@param[\s]*/,"");
    var s = params[j].split(" ");
    var param = new GHDOC.Parameter();
    param.type = s[0].trim();
    param.name = s[1].trim();
    s.shift(); s.shift();
    param.desc = s.join(" ");
    result.push(param);
  }
  return result;
};

/**
 * @fn GHDOC.ParseBrief
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
 * @class GHDOC.Class
 * @brief A representation of a class.
 */
GHDOC.Class = function(){
  this.parent = null;
  this.methods = [];
  this.properties = [];
  this.parameters = []; // for constructor
};

/**
 * A representation of a class method.
 * @class GHDOC.Method
 */
GHDOC.Method = function(){
  this.name = "(untitled method)";
  this.brief = "";
  this.description = "";
  this.parameters = [];
  this.memberof = "";
};

/**
 * A representation of a function
 * @class GHDOC.Function
 */
GHDOC.Function = function(){
  this.name = "(untitled function)";
  this.brief = "";
  this.description = "";
  this.parameters = [];
};

/**
 * A representation of a class property.
 * @class GHDOC.Property
 */
GHDOC.Property = function(){
  this.type = "";
  this.name = "";
};

/**
 * A representation of a class property.
 * @class GHDOC.Parameter
 */
GHDOC.Parameter = function(){
  this.type = "";
  this.name = "";
};