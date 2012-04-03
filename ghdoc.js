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

GHDOC.File = function(user,repos,branch,filename){
  // Get file contents
  var url = "https://github.com/api/v2/json/blob/show/"+user+"/"+repos+"/"+branch+"/"+filename;
  $.ajax({
      url:url,
      dataType:'jsonp',
      success:function(data){
      }
    });
};

/**
 *
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
 * Parse source code.
 * @param string src
 */
GHDOC.Parse = function(src){
  src = "/**\n * @param array test A testing parameter...\n * @param int Another one\n */\nfunction test(test){};";
  var blocks = src.match(/\/\*\*([.\n\s\t\w*@]*)\*\//gm);
  for(i in blocks){
    blocks[i] = blocks[i]
      .replace(/^\/\*\*[\n\t\r]*/,"")
      .replace(/[\n\t\r]*\*\/$/,"");
    var lines = blocks[i].split("\n");
    for(j in lines)
      lines[j] = lines[j].replace(/^[\s\t]*\*[\s\t]*/,"");
    blocks[i] = lines.join("\n");
    var params = blocks[i].match(/@param([^@]*)/g);
    for(j in params){
      params[j] = params[j]
	.replace(/[\s]*@param[\s]*/,"");
      var s = params[j].split(" ");
      var param = {};
      param.type = s[0];
      param.name = s[1];
      s.shift(); s.shift();
      param.desc = s.join(" ");
    }
  }
};

/**
 * A representation of a class.
 */
GHDOC.Class = function(){
  this.parent = null;
  this.methods = [];
  this.properties = [];
};

/**
 * A representation of a class method.
 */
GHDOC.Method = function(){
  this.name = "(untitled method)";
  this.brief = "";
  this.description = "";
  this.parameters = [];
};

/**
 * A representation of a class property.
 */
GHDOC.Property = function(){
  this.type = "";
  this.name = "";
};