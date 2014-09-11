(function() {
  var PROJ_TIMESHEET = 'Other activities';
  var TASK_TIMESHEET = 'Timesheet recording';

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
    dialog = $('<div style="background-color: #ccc;"> \
      <div> \
        <label id="weeklyHours">Weekly hours</label> \
        <input type="text" name="weekhours" value="37.5"> \
      </div> \
      <div> \
        <label>~ Timesheet recording hours</label> \
        <input type="text" name="timesheethours" value="2"> \
      </div> \
      <div> \
        <label>~ Shards</label> \
        <input type="text" name="shards" value="4"> \
      </div> \
      <div> \
        <label>~ Start time</label> \
        <input type="text" name="starttime" value="820"> \
      </div> \
      <div> \
        <label>Project:</label> \
        <input type="text" name="project"> \
      </div> \
      <div> \
        <label>Task:</label> \
        <input type="text" name="task"> \
      </div> \
      <div> \
        <label>Notes:</label> \
        <input type="text" name="notes"> \
      </div> \
      <div> \
        <label>Days:</label> \
        <input type="text" name="days"> \
      </div> \
      <button id="addTask">Add Task</button> \
      <table id="time"> \
        <tr> \
          <td>Day</td> \
          <td>Hours</td> \
          <td>Project</td> \
          <td>Task</td> \
          <td>Notes</td> \
        </tr> \
      </table> \
      <button id="shatter">Shatter</button> \
    </div>');
    dialog.dialog({
      modal: true,
      height: 600,
      width: 600
    });

    $('.ui-dialog-titlebar-close').remove();

    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    for(var d in days) {
      addBlankTask(d);
      addTask(d, $('input[name="timesheethours"]').val()/5, PROJ_TIMESHEET, TASK_TIMESHEET);
    }
    
    var day = 0;

    function sumDay(day_) {
      var d = day_ || day;
      var d = days[d];
      var sum = 0;
      $('.' + d).each(function(i,e) {        
        $(e).find('.hours').each(function(i,e) {
          sum += Number($(e).text());
        });
      });
      return sum;
    }

    function updateWeeklyHours() {
      var s = 0;
      for(var d in days) {
        s += sumDay(d);
      }
      s = s.toFixed(2);
      $('#weeklyHours').text('Weekly hours (' + s + ')');
    }

    function addBlankTask(day, after) {
      var d = days[day];
      var row = $('<tr class="' + d + '"><td>' + d + '</td></tr>');
      if (after) {
        after.after(row);
      } else {
        row.appendTo('#time');
      }
      return row;
    }

    function addTask(day, hours, project, task, notes) {
      var d = days[day];
      var existingRows = $('.' + d);
      var lastRow = $(existingRows[existingRows.length - 1]);
      if (lastRow.find('.hours').length !== 0) {
        lastRow = addBlankTask(day, lastRow);
      }      
      $('<td>')
        .addClass('hours')
        .text(hours)
        .appendTo(lastRow);

      $('<td>')
        .addClass('project')
        .text(project)
        .appendTo(lastRow);

      $('<td>')
        .addClass('task')
        .text(task)
        .appendTo(lastRow);

      $('<td>')
        .addClass('notes')
        .text(notes)
        .appendTo(lastRow);

      $('<a>')
        .text('again')
        .attr('href', '#')
        .click(function() {
          $('input[name="project"]').val(project);
          $('input[name="task"]').val(task);
          $('input[name="days"]').val(hours/7.5);
          $('input[name="notes"]').val(notes);
        })
        .appendTo(
        $('<td>')
          .addClass('again')        
          .appendTo(lastRow));
    }    

    $('#addTask').click(function(e) {
      e.preventDefault();

      var project = $('input[name="project"]').val();
      var task = $('input[name="task"]').val();
      var hours = $('input[name="days"]').val() * 7.5;
      var notes = $('input[name="notes"]').val();
      
      if (project === '' || task === '' || hours === 0) {
        return;
      }

      while (hours > 0) {
        console.log(hours);
        var currentDayTotal = sumDay();
        if (currentDayTotal >= 7.5) {
          day++;
        }
        if (day >= days.length) { return; }
        currentDayTotal = sumDay();
        var max = 7.5 - currentDayTotal;
        var h = Math.min(hours, max);
        hours -= max;

        h = h.toFixed(2);
        addTask(day, h, project, task, notes);
        updateWeeklyHours();
      }
    });

    $('#shatter').click(function(e) {
      e.preventDefault();

      var shards = {};
      var shardCount = Number($('input[name="shards"]').val());

      for (d in days) {
        var tasks = $('.' + days[d]);
        tasks.each(function(i, e) {
          var time = Number($(e).find('.hours').text());
          var project = $(e).find('.project').text();
          var task = $(e).find('.task').text();
          var notes = $(e).find('.notes').text();

          if (project === PROJ_TIMESHEET && task === TASK_TIMESHEET) { return; }

          time = Math.floor(time * 60);
          var ts = time / shardCount;
          
          if (shards[d] === undefined) { shards[d] = []; }
          var s = shards[d];
          
          var i = 0;
          while (time > 0) {
            var jitter = Math.random() * (ts/10 - ts/20);
            var jittered = ts + jitter;
            var mins = Math.floor(jittered);
            time -= mins;

            if (s[i] === undefined) { s[i] = []; }
            s[i].push({
              day: days[d],
              d: d,
              project: project,
              task: task,
              notes: notes,
              mins: mins
            });
            i++;
          }
        });
      }
      $.each(shards, function(k, v) {
        $.each(v, function(k, v) {
          $.each(v, function(k, v) {
            console.log(v);
          });
        });
      })
    });
  }

  function goPressed() {
    dialog.dialog('close');
    alert('blah');
  };

})();