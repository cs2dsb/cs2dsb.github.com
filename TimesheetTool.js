(function() {
  var script = document.createElement('script'); 
  script.type = 'text/javascript'; 
  script.src = 'https://code.jquery.com/jquery-2.1.1.min.js';
  script.onreadystatechange = jqueryLoaded;
  script.onload = jqueryLoaded;
  document.body.appendChild(script);

  function jqueryLoaded() {
    $('<div>')
      .appendTo('body')
      .load('http://cs2dsb.github.io/timesheetForm.html')
      .dialog({
        title: 'Timesheet form'
      });    
  }
})();