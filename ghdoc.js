/**
 * Doxygen documentation generator for Github repositories
 * @see http://www.stack.nl/~dimitri/doxygen/commands.html
 */
$(function(){

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

    function updatefrontpage(){
      $("#overview")
	.html("<h1>Overview</h1>");
    }

    // Get the file tree
    $.ajax({
	url:"http://github.com/api/v2/json/repos/show/"+username+"/"+repository+"/branches",
	dataType:'jsonp',
	success:function(data){
	  // Loop through branches
	  for(branch in data.branches){
	    var t = new GHDOC.Tree(username,repository, data.branches[branch], branch);
	    branches.push(t);
	  }
	  updatefrontpage();
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
GHDOC.File = function(user,repos,branch,filename){
  // Get file contents
  var url = "https://github.com/api/v2/json/blob/show/"+user+"/"+repos+"/"+branch+"/"+filename;
  $.ajax({
      url:url,
      dataType:'jsonp',
      success:function(data){
	console.log(GHDOC.Parse(data.blob.data));
      }
    });
};

/**
 * @param string user
 * @param string repos
 * @param string branch
 * @param string name
 */
GHDOC.Tree = function(user,repos,branch,name){
  this.filter = "*";
  this.name = name || "Untitled branch";
  this.files = [];

  var that = this;
  $.ajax({
      url:"http://github.com/api/v2/json/tree/show/"+user+"/"+repos+"/"+branch,
	dataType:'jsonp',
	success:function(data){
	// Loop through files
	for(i in data.tree){
	  if(data.tree[i].type=="blob"){
	    that.files.push(new GHDOC.File(user,repos,branch,data.tree[i].name));
	  }
	  // @todo sub branch
	}
      }
    });
};

/**
 * @fn GHDOC.Parse
 * @brief Parse source code.
 * @param string src
 * @return array An array of parsed objects
 */
GHDOC.Parse = function(src){

  var result = [];

  // Get doc blocks a la doxygen
  var blocks = src.match(/\/\*\*([.\n\s\t\r\w*@]*)\*\//gm);
  //console.log(src);
  console.log("Found "+(blocks ? blocks.length : 0) +" blocks");
  for(i in blocks){

    // trim
    blocks[i] = blocks[i]
      .replace(/^\/\*\*[\n\t\r]*/,"")
      .replace(/[\n\t\r]*\*\/$/,"");
    var lines = blocks[i].split("\n");
    for(j in lines)
      lines[j] = lines[j].replace(/^[\s\t]*\*[\s\t]*/,"");
    blocks[i] = lines.join("\n");

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

    // Classes have "@class" to define their name
    var classes = blocks[i].match(/\@class([^@]*)/g);
    for(j in classes){
      classes[j] = classes[j]
	.replace(/[\s]*@class[\s]*/,"");
      var s = classes[j];
      var c = new GHDOC.Class();
      c.name = s;
      c.parameters = GHDOC.ParseParameters(blocks[i]);
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
    param.type = s[0];
    param.name = s[1];
    s.shift(); s.shift();
    param.desc = s.join(" ");
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