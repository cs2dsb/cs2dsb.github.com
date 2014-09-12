(function() {
  var PROJ_TIMESHEET = 'Other activities';
  var TASK_TIMESHEET = 'Timesheet recording';
  var PROJ_CATCHUP = 'Other activities';
  var TASK_CATCHUP = 'Daily Standup';
  var TIME_CATCHUP_START = 1005;
  var TIME_CATCHUP_END = 1015;  
  var TIME_LUNCH_START = 1200;
  var TIME_LUNCH_END = 1245;  

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
      <table id="time" style="border-collapse:collapse; border-spacing:0"> \
        <tr> \
          <td>Day</td> \
          <td>Hours</td> \
          <td>Project</td> \
          <td>Task</td> \
          <td>Notes</td> \
        </tr> \
      </table> \
      <button id="shatter" style="display:none">Shatter</button> \
      <button id="run" style="display:none">Write to timesheet system</button> \
    </div>');
    dialog.dialog({
      modal: true,
      width: 1200
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

    function hoursIntTime(t) {
      var h = Math.floor(t / 100);
      return h;
    }

    function minsIntTime(t) {
      var h = hoursIntTime(t);
      var m = t - (h * 100);
      return m;
    }

    function hmToIntTime(h, m) {
      var t = m;
      t += h * 100;
      return t;
    }

    function addMinsToIntTime(t, m) {      
      var hm = 0;
      hm += hoursIntTime(t) * 60;
      hm += minsIntTime(t);
      hm += m;
      
      var h = Math.floor(hm / 60);
      var m = hm - (h * 60);
      return hmToIntTime(h, m);
    }

    function minsBetweenIntTimes(t1, t2) {
      var t1h = hoursIntTime(t1);
      var t2h = hoursIntTime(t2);
      var t1m = minsIntTime(t1);
      var t2m = minsIntTime(t2);
  
      var d = (t2h * 60 + t2m) - (t1h * 60 + t1m);
      return d;
    }

    window.x = minsBetweenIntTimes;

    function updateWeeklyHours() {
      var s = 0;
      for(var d in days) {
        s += sumDay(d);
      }
      s = s.toFixed(2);
      $('#weeklyHours').text('Weekly hours (' + s + ')');
      if (s >= $('input[name="weekhours"]').val()) {
        $('#shatter').show();
        $('input[name="project"],input[name="task"],input[name="starttime"],input[name="shards"],input[name="timesheethours"],input[name="weekhours"],input[name="notes"],input[name="days"],label,#addTask').hide();
      }
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
      var startTime = Number($('input[name="starttime"]').val());
      var timesheetHours = Number($('input[name="timesheethours"]').val());

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
      
      var tasks = [];
      $.each(shards, function(k, v) {
        $.each(v, function(k, v) {
          $.each(v, function(k, v) {
            tasks.push(v);
          });
        });
      })

      var day = -1;
      var time;
      var outputTasks = [];
      var timesheetMinsPerTask = timesheetHours * 60 / (tasks.length + 5 * 2) //catchup and lunch
      timesheetMinsPerTask = Math.ceil(timesheetMinsPerTask);
      
      while (tasks.length > 0) {
        var task = tasks[0];
        if (task.d > day) { 
          day = task.d;
          time = startTime;
        }

        var newTask = {
          d: day,
          day: days[day],
          project: task.project,
          task: task.task,
          notes: task.notes,
          startTime: time,
          endTime: time
        };
        outputTasks.push(newTask);

        var endTime = addMinsToIntTime(time, task.mins);
        if (time < TIME_CATCHUP_START && endTime >= TIME_CATCHUP_START) {
          endTime = addMinsToIntTime(TIME_CATCHUP_START, -timesheetMinsPerTask);          
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_TIMESHEET,
            task: TASK_TIMESHEET,
            notes: '',
            startTime: endTime,
            endTime: addMinsToIntTime(endTime, timesheetMinsPerTask)
          });
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_CATCHUP,
            task: TASK_CATCHUP,
            notes: '',
            startTime: TIME_CATCHUP_START,
            endTime: TIME_CATCHUP_END
          });
          time = addMinsToIntTime(TIME_CATCHUP_END, timesheetMinsPerTask);
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_TIMESHEET,
            task: TASK_TIMESHEET,
            notes: '',
            startTime: TIME_CATCHUP_END,
            endTime: time
          });    
        } else if (time < TIME_LUNCH_START && endTime > TIME_LUNCH_END) {
          endTime = addMinsToIntTime(TIME_LUNCH_START, -timesheetMinsPerTask);
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_TIMESHEET,
            task: TASK_TIMESHEET,
            notes: '',
            startTime: endTime,
            endTime: addMinsToIntTime(endTime, timesheetMinsPerTask)
          });         
          time = addMinsToIntTime(TIME_LUNCH_END, timesheetMinsPerTask);
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_TIMESHEET,
            task: TASK_TIMESHEET,
            notes: '',
            startTime: TIME_LUNCH_END,
            endTime: time
          });    
        }

        newTask.endTime = endTime;
        task.mins -= minsBetweenIntTimes(newTask.startTime, newTask.endTime);        
        if (task.mins <= 0) {
          time = addMinsToIntTime(endTime, timesheetMinsPerTask)
          outputTasks.push({
            d: day,
            day: days[day],
            project: PROJ_TIMESHEET,
            task: TASK_TIMESHEET,
            notes: '',
            startTime: endTime,
            endTime: time
          });   
          tasks.splice(0,1);
        }
      }

      displayShatteredTasks(outputTasks);

      function displayShatteredTasks(tasks) {
        $('#time').empty();
        $('#shatter').remove();
        var addRow = function(vals, heading) {
          var head = heading === undefined ? true : heading;
          if (Object.prototype.toString.call(vals) === '[object Array]') {
            var row = $('<tr>').appendTo('#time');
            for (var i in vals) {
              var col = $('<td>').appendTo(row);
              if (head) {
                col.text(vals[i]);
              } else {
                $('<input type="text">')
                  .appendTo(col)
                  .val(vals[i]);
              }
            }
          } else {
            addRow([vals.day, vals.startTime, vals.endTime, vals.project, vals.task, vals.notes], false);
          }
        }
        addRow(['Day', 'StartTime', 'EndTime', 'Project', 'Task', 'Notes', 'Status']);
        $.each(outputTasks, function(i, v) {
          addRow(v);
        });

        $('#run').show();
      };
    });
  
  }

  function goPressed() {
    dialog.dialog('close');
    alert('blah');
  };

})();