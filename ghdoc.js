/**
 * Doxygen documentation generator for Github repositories
 * @see http://www.stack.nl/~dimitri/doxygen/commands.html
 */
$(function(){

    var repos = "schteppe/cannon.js";

    /*
    $.ajax({
	url:"https://github.com/api/v2/json/blob/all/schteppe/cannon.js/master",
	dataType:'jsonp',
	success:function(data){
	  
	}
      });
    */

    var src = "/**\n * @param array test A testing parameter...\n * @param int Another one\n */\nfunction test(test){};";
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
	console.log(param);
      }
    }

    $.ajax({
	url:"http://github.com/api/v2/json/repos/show/"+repos+"/branches",
	dataType:'jsonp',
	success:function(data){

	  // Loop through branches
	  for(branch in data.branches){
	    //console.log("loading branch "+branch+"...");
	    var mybranch = branch+"";
	    $.ajax({
		url:"http://github.com/api/v2/json/tree/show/"+repos+"/"+data.branches[mybranch],
		dataType:'jsonp',
		success:function(data2){
		  // Loop through files
		  for(i in data2.tree){
		    var myi = i+"";
		    if(data2.tree[i].type=="blob"){
		      // Get file contents
		      var url = "https://github.com/api/v2/json/blob/show/"+repos+"/"+data.branches[mybranch]+"/"+data2.tree[myi].name;
		      //console.log("loading "+"https://github.com/api/v2/json/blob/show/schteppe/cannon.js/"+data.branches[mybranch]+"/"+data2.tree[myi].name+" from branch "+mybranch);
		      $.ajax({
			  url:url,
			  dataType:'jsonp',
			  success:function(data2){
			    
			  },
			  error:function(){
			    //console.log("could not load "+url);
			  }
			});
		    }
		  }
		}
	      });
	  }
	}
      });

  });