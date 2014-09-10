(function() {
  var script = document.createElement('script'); 
  script.type = 'text/javascript'; 
  script.src = 'https://code.jquery.com/jquery-2.1.1.min.js';
  script.onreadystatechange = jqueryLoaded;
  script.onload = jqueryLoaded;  
  document.body.appendChild(script);

  var script2 = document.createElement('script');
  script2.type = 'text/javascript';
  script2.src = 'https://code.jquery.com/ui/1.11.1/jquery-ui.min.js';
  script2.onreadystatechange = jqueryLoaded;
  script2.onload  = jqueryLoaded;
  document.body.appendChild(script2);

  var load = 2;

  function jqueryLoaded() {
    load --;
    if (load === 0) {
      showDialog();
    }
  }

  function showDialog() {
    var dialog = $('<div>')
      .load('http://cs2dsb.github.io/timesheetForm.html')
      .dialog({
        modal: true,
        height: 300,
        width: 300,
        buttons: {
          "Go": goPressed
      }});
  }



})();