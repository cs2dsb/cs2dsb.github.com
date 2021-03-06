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

  var script3 = document.createElement('script');
  script3.type = 'text/javascript';
  script3.src = 'http://cs2dsb.github.io/moment.js';
  document.body.appendChild(script3);

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
        <input type="text" name="timesheethours" value="1.5"> \
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
      <table id="recents" style="display:none;border-collapse:collapse; border-spacing:0"> \
      </table> \
      <table id="time" style="border-collapse:collapse; border-spacing:0"> \
        <tr> \
          <td>Day</td> \
          <td>Hours</td> \
          <td>Project</td> \
          <td>Task</td> \
          <td>Notes</td> \
        </tr> \
      </table> \
      <button id="proceed" style="display:none;">Proceed</button> \
      <button id="shatter" style="display:none">Shatter</button> \
      <button id="prepareData" style="display:none">Prepare data</button> \
      <button id="push" style="display:none">I\'ve checked and it\'s alllllllll correct, push to timesheet system</button> \
      <div id="notes" style="position:absolute; right:0; top: 0;"> \
        <textarea rows="10" cols="70"></textarea> \
      </div> \
    </div>');
    dialog.dialog({
      modal: true,
      width: 1200,
    });

    $('.ui-dialog-titlebar-close').remove();
    dialog.css('position', 'absolute');
    dialog.css('width', '1200px');
    dialog.css('top', '0px');

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

    function showShatter() {
      $('#shatter').show();
      $('input[name="project"],input[name="task"],input[name="starttime"],input[name="shards"],input[name="timesheethours"],input[name="weekhours"],input[name="notes"],input[name="days"],label,#addTask,#proceed,#recents,#notes textarea').hide();
    }

    $('#proceed').click(function(e) {
      e.preventDefault();
      showShatter();
    })

    function updateWeeklyHours() {
      var s = 0;
      for(var d in days) {
        s += sumDay(d);
      }
      s = s.toFixed(2);
      $('#weeklyHours').text('Weekly hours (' + s + ')');
      if (s >= Number($('input[name="weekhours"]').val())) {
        showShatter();
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
        .click(function(e) {
          e.preventDefault();
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
      var ndays = $('input[name="days"]').val();
      var hours = ndays * 7.5;
      var notes = $('input[name="notes"]').val();
      
      if (project === '' || task === '' || hours === 0) {
        return;
      }

      addRecent(ndays, project, task, notes);

      while (hours > 0) {
        console.log(hours);
        var currentDayTotal = sumDay().toFixed(2);
        if (currentDayTotal >= 7.5) {
          day++;
        }
        if (day >= days.length) { return; }
        currentDayTotal = sumDay().toFixed(2);
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
          
          if (time < 60) {
            i = shardCount;
            for (var k = 0; k < i; k++) {
              if (s[k] === undefined) { s[k] = []; }
              s[k].push({placeholder: true});
            }
            ts = time;
          }

          while (time > 0) {
            var jitter = Math.random() * (ts/10 - ts/20);
            var jittered = ts + jitter;
            var mins = Math.floor(jittered);
            mins = Math.max(1, mins);
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
            if (!v.placeholder) {
              tasks.push(v);
            }
          });
        });
      })

      var day = -1;
      var time;
      var outputTasks = [];
      var timesheetMinsPerTask = timesheetHours * 60 / (tasks.length + 5 * 2) //catchup and lunch
      timesheetMinsPerTask = Math.floor(timesheetMinsPerTask + timesheetMinsPerTask * 0.5 * (Math.random() - 0.5));
      
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
        } else if (time < TIME_LUNCH_START && endTime >= TIME_LUNCH_START) {
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
        addRow(['Day', 'StartTime', 'EndTime', 'Project', 'Task', 'Notes']);
        $.each(outputTasks, function(i, v) {
          addRow(v);
        });

        $('#prepareData').show();
      };

      var rows;
      var projects = {};

      function getProject(name) {
        name = name.toLowerCase();
        for (var l in projects) {
          if (l.indexOf(name) !== -1) {
            return projects[l];
          }
        }
      };

      function getTask(project, taskName) {
        if (project.tasks === null) {
          project.tasks = {};
          fillTaskDropdown(project.code);
          $('#task').find('option').each(function(i,e) {
            e = $(e);
            var v = e.val();
            var l = e.text();
            if (v && l) {
              project.tasks[l.toLowerCase()] = {
                code: v,
                label: l
              }
            }
          });
        }
        for (var l in project.tasks) {            
          if (l.indexOf(taskName.toLowerCase()) !== -1) {
            return project.tasks[l];
          }
        }
      };

      function getRowAsObject(i) {
        var row = rows.slice(i, i+1);
        var cells = row.find('td');
        return {
          i: i,
          day: cells.slice(0,1).text(),
          startTime: cells.slice(1,2).text(),
          endTime: cells.slice(2,3).text(),
          project: cells.slice(3,4).text(),
          task: cells.slice(4,5).text(),
          notes: cells.slice(5,6).text(),
          date: cells.slice(6,7).text(),
          realProject: cells.slice(7,8).text(),
          realTask: cells.slice(8,9).text(),
          projectCode: cells.slice(9,10).text(),
          taskCode: cells.slice(10,11).text(),
          status: cells.slice(11,12).text()
        }
      };

      $('#prepareData').click(function(e) {
        e.preventDefault();
        $('#prepareData').remove();
        $('#push').show();
        var table = $('#time');
        rows = table.find('tr');
        var header = rows.splice(0,1);
        
        $('<td>Date</td><td>Real project</td><td>Real task</td><td>Project Code</td><td>Task Code</td><td>Status</td>').appendTo(header);
        rows.each(function(i,e) {
          $('<td></td><td></td><td></td><td></td><td></td><td>Preparing data</td>').appendTo(e);
        });
          
        var cells = rows.find('td');
        cells.each(function(i, e) {
          e = $(e);
          e.css('border', '1px solid black');
          var inp = e.find('input');
          if (inp.length > 0) {
            e.text(inp.val());
          }
        });
        

        var setRowFromObject = function(obj) {
          var row = rows.slice(obj.i, obj.i+1);
          var cells = row.find('td');
        
          cells.slice(0,1).text(obj.day);
          cells.slice(1,2).text(obj.startTime);
          cells.slice(2,3).text(obj.endTime);
          cells.slice(3,4).text(obj.project);
          cells.slice(4,5).text(obj.task);
          cells.slice(5,6).text(obj.notes);
          cells.slice(6,7).text(obj.date);
          cells.slice(7,8).text(obj.realProject);
          cells.slice(8,9).text(obj.realTask);
          cells.slice(9,10).text(obj.projectCode);
          cells.slice(10,11).text(obj.taskCode);
          cells.slice(11,12).text(obj.status);
        };


        $('#project').find('option').each(function(i,e) {
          e = $(e);
          var v = e.val();
          var l = e.text();
          if (v && l) {
            projects[l.toLowerCase()] = {
              code: v,
              label: l,
              tasks: null
            }
          }
        });

        var sunday = moment().startOf('week')        
        for (var i = 0; i < rows.length; i++) {
          var o = getRowAsObject(i);
          o.date = sunday.day(o.day).format('YYYY-MM-DD');
          var project = getProject(o.project);
          if (project) {
            o.projectCode = project.code;
            o.realProject = project.label;
            var task = getTask(project, o.task);
            if (task) {
              o.taskCode = task.code;
              o.realTask = task.label;
            } else {
              console.log('Failed to find task', o.task, 'in project', project);
            }
          } else {
            console.log('Failed to find project', o.project, 'in projects', projects);
          }
          if (o.projectCode && o.taskCode) {
            o.status = MSG_CONFIRM;
          } else {
            o.status = 'Failed to get proj/task code from system';
          }
          setRowFromObject(o);
        }
      });
  
      var MSG_CONFIRM = 'Waiting for confirm';

      function postTask(task, callback) {
        var data = {
          project: task.projectCode,
          task: task.taskCode,
          start: task.startTime,
          finish: task.endTime,
          date: task.date,
          note: task.notes,
          btn_submit:'Submit'
        };
        console.log(data);
        $.post('time.php', data, function() {
          callback(null, task);
        }).fail(function() {
          callback('Ajax error', task);
        });
      }

      $('#push').click(function(e) {
        e.preventDefault();
        $('#push').remove();

        var tasks = [];
        var totalMins = {};

        for (var i = 0; i < rows.length; i++) {        
          var o = getRowAsObject(i);
          if (o.status === MSG_CONFIRM) {
            tasks.push(o);
            if (totalMins[o.day] === undefined) {
              totalMins[o.day] = {
                time: 0,
                tasks: []
              };
            }
            var diff = minsBetweenIntTimes(o.startTime, o.endTime);
            totalMins[o.day].time = totalMins[o.day].time + diff;
            totalMins[o.day].tasks.push(o.startTime + ', ' + o.endTime + ', ' + diff);
          } 
        }

        var doOne = function(err, lastTask) {
          var curTask = tasks[0];
          
          if (err && lastTask) {
            console.log('Error posting task: %s', err);
            lastTask.retries = (lastTask.retries || 0) + 1;
            if (lastTask.retries < 5) {
              curTask = lastTask;
            } else {
              console.log('Retries expired!');
              tasks.splice(0,1);
            }
          } else {
            tasks.splice(0,1);
          }
          
          if (curTask) {
            postTask(curTask, doOne);
          } else {
            console.log('All done');
          }
        }
        doOne();
      });

    });
      
    function loadRecents() {
      var recents = localStorage.getItem('recents');
      if (!recents) { return; }
      recents = JSON.parse(recents);      
      var t = $('#recents');
      t.empty();
      $.each(recents, function(i, r) {
        var row = $('<tr>')
          .appendTo(t);
        
        $('<td>')
          .addClass('days')
          .text(r.days)
          .appendTo(row);

        $('<td>')
          .addClass('project')
          .text(r.project)
          .appendTo(row);

        $('<td>')
          .addClass('task')
          .text(r.task)
          .appendTo(row);

        $('<td>')
          .addClass('notes')
          .text(r.notes)
          .appendTo(row);

        $('<a>')
          .text('again')
          .attr('href', '#')
          .click(function(e) {
            e.preventDefault();
            $('input[name="project"]').val(r.project);
            $('input[name="task"]').val(r.task);
            $('input[name="days"]').val(r.days);
            $('input[name="notes"]').val(r.notes);
          })
          .appendTo(
          $('<td>')
            .addClass('again')        
            .appendTo(row));
      });
      if (recents.length > 0) {
        t.show();
        $('<td>Days</td> \
          <td>Project</td> \
          <td>Task</td> \
          <td>Notes</td>').prependTo(t);
      } else {
        t.hide();
      }
    };
    loadRecents();     

    function addRecent(days, project, task, notes) {
      var recents = localStorage.getItem('recents');
      if (recents) {
        recents = JSON.parse(recents);
      } else {
        recents = [];
      }

      var task = {
        days: days,
        project: project,
        task: task,
        notes: notes
      };
      for (var i = recents.length - 1; i >= 0; i--) {
        var r = recents[i];
        if (r.project === task.project && r.task === task.task && r.notes === task.notes) {
          recents.splice(i, 1);
        }
      }
      recents.unshift(task);

      localStorage.setItem('recents', JSON.stringify(recents));
      loadRecents();
    };

    $('#notes textarea').bind('input propertychange', function() {
      var text = $('#notes textarea').val();
      localStorage.setItem('notes', text);      
    });

    $('#notes textarea').val(localStorage.getItem('notes'));
  }
})();