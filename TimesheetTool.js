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

  var dialog;

  function showDialog() {
    dialog = $('<div>');

    var form = $('<form>')
      .attr('id', 'timesheetForm')
      .css('background-colour', '#ccc')
      .submit(goPressed)
      .appendTo(dialog);

    var row = $('<div>');

    $('<label>')
      .text('Weekly hours:')
      .appendTo(row);

    $('<input>')
      .attr('type', 'text')
      .attr('name', 'weekhours')
      .value(37.5)
      .appendTo(row);

    row.appendTo(form);

    dialog.dialog({
      modal: true,
      height: 300,
      width: 300
    });

    $('.ui-dialog-titlebar-close').remove();
  }

  function goPressed() {
    dialog.dialog('close');
    alert('blah');
  };

})();