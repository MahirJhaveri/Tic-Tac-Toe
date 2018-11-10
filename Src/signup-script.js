
const PORT = "localhost";

function validate_name(){
  var name = document.forms['signup-form']['name'].value;
  console.log(name);
  if(name.length < 4){
    alert("Name must have atleast 4 characters.");
    return false;
  }
  else{
    return check_with_server(name);
  }
}


function check_with_server(name){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      var obj = JSON.parse(this.responseText);
      var messageStatus = obj["messageStatus"];
      console.log(obj);
      if(messageStatus == 1){
        //alert("You're all set!");
        window.location = "http://" + PORT + ":3000/game";
        return true;
      }
      else{
        var message = obj["message"];
        alert(message);
        return false;
      }
    }
  };
  xhttp.open("GET", "check_name?name=" + name, false);
  xhttp.send();
}


function test(){
  console.log("Width = " + $('.test span').width() + ".");
  console.log("Width of parent = " + $('.test').parent().width() + ".");
  let parent_width = $('.test').parent().width();
  let em_width = $('.test span').width();
  let count = parent_width/em_width;
  let str = ""
  for(var i = 1; i < count; i++){
    str += '<span><i class="em em-monkey"></i><i class="em em-banana"></i></span>';
  }
  $('.test').html(str);
}

$(document).ready(test);
