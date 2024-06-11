// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
  const currentDate = dayjs().format("YYYYMMDD"); // Get the current date in YYYYMMDD format
  const currentTime = dayjs().format("HHmmss"); // Get the current time in HHmmss format
  const uniqueId = `${currentDate}-${currentTime}`; // Combine date and time components

  return uniqueId;
}

const taskId = generateTaskId();
console.log(taskId);

// Create a function to create a task card
function createTaskCard(task) {
  const card = document.createElement("div");
  card.classList.add("task-card", "card", "mb-3");
  card.setAttribute("id", `task-${task.id}`);
  card.setAttribute("draggable", "true");

  const today = new Date();
  const dueDate = new Date(task.dueDate);
  if (dueDate < today) {
    card.classList.add("overdue");
  } else if (dueDate >= today) {
    card.classList.add("due-soon");
  }

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  cardTitle.textContent = task.title;

  const cardText = document.createElement("p");
  cardText.classList.add("card-text");
  cardText.textContent = task.description;

  const cardDueDate = document.createElement("p");
  cardDueDate.classList.add("card-text");
  cardDueDate.textContent = `Due: ${task.dueDate}`;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => handleDeleteTask(task.id);

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
  cardBody.appendChild(cardDueDate);
  cardBody.appendChild(deleteButton);
  card.appendChild(cardBody);

  return card;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  const todoLane = document.getElementById("todo-cards");
  const inProgressLane = document.getElementById("in-progress-cards");
  const doneLane = document.getElementById("done-cards");

  while (todoLane.firstChild) {
    todoLane.removeChild(todoLane.firstChild);
  }
  while (inProgressLane.firstChild) {
    inProgressLane.removeChild(inProgressLane.firstChild);
  }
  while (doneLane.firstChild) {
    doneLane.removeChild(doneLane.firstChild);
  }

  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);
    if (task.status === "to-do") {
      todoLane.appendChild(taskCard);
    } else if (task.status === "in-progress") {
      inProgressLane.appendChild(taskCard);
    } else if (task.status === "done") {
      doneLane.appendChild(taskCard);
    }
  });

  makeCardsDraggable();
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const dueDate = document.getElementById("task-due-date").value;

  const newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate,
    status: "to-do",
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  renderTaskList();
  document.getElementById("task-form").reset();
  $("#formModal").modal("hide");
}

// Create a function to handle deleting a task
function handleDeleteTask(taskId) {
  taskList = taskList.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr("id").split("-")[1];
  const newStatus = event.target.id;

  const task = taskList.find((task) => task.id == taskId);
  if (task) {
    task.status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  } else {
    console.error(`Task with id ${taskId} not found`);
  }
}

// Make task cards draggable
function makeCardsDraggable() {
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    start: function () {
      $(this).addClass("dragging");
    },
    stop: function () {
      $(this).removeClass("dragging");
    },
  });
}

// Make lanes droppable
function makeLanesDroppable() {
  $(".lane").droppable({
    accept: ".task-card",
    drop: function (event, ui) {
      const newStatus = event.target.id;
      handleDrop(event, ui, newStatus);
    },
    hoverClass: "bg-secondary",
  });
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  makeLanesDroppable();
  $("#task-due-date").datepicker();
  $("#task-form").on("submit", handleAddTask);
});
