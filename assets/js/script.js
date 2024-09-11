let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

function generateTaskId() {
  return nextId++;
}

function createTaskCard(task) {
  const taskCard = $(`
    <div class="card task-card mb-3" id="task-${task.id}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><strong>Due:</strong> ${dayjs(task.dueDate).format('MMM D, YYYY')}</p>
        <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
      </div>
    </div>
  `);

  const dueDate = dayjs(task.dueDate);
  if (dayjs().isAfter(dueDate)) {
    taskCard.addClass('bg-danger text-white');
  } else if (dayjs().add(3, 'day').isAfter(dueDate)) {
    taskCard.addClass('bg-warning text-dark');
  }

  return taskCard;
}

function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard); 
  });


  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    appendTo: "body", 
    zIndex: 1000, 
    scroll: false,
    start: function (event, ui) {
      $(this).css("opacity", "0.5");
      $(ui.helper).css("z-index", "1000");
    },
    stop: function (event, ui) {
      $(this).css("opacity", "1");
    }
  });
}


function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();

  if (title && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: "todo"
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    renderTaskList();
    $("#formModal").modal('hide'); 
  } else {
    alert("Please fill in all fields.");
  }
}


function handleDeleteTask(event) {
  const taskId = $(event.target).data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}


function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id"); 
  const newStatus = $(this).attr("id").replace("-cards", ""); 

  
  taskList = taskList.map(task => task.id === taskId ? { ...task, status: newStatus } : task);

  
  localStorage.setItem("tasks", JSON.stringify(taskList));

  
  renderTaskList();
}


$(document).ready(function () {
  
  $("#taskDueDate").datepicker({ dateFormat: "yy-mm-dd" });

 
  renderTaskList();

  $(".card-body").droppable({
    accept: ".task-card", 
    hoverClass: "drop-hover", 
    drop: handleDrop 
  });

  
  $("#addTaskForm").on("submit", handleAddTask);

  
  $(document).on("click", ".delete-task", handleDeleteTask);
});
