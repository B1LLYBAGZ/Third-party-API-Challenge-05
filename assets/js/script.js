// Retrieve tasks and nextId from localStorage
// Initialize taskList with stored tasks or an empty array if none are found
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
// Initialize nextId with stored value or start from 1 if none is found
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
  // Create a new div element for the task card
  const card = document.createElement("div");
  // Add classes to the card for styling
  card.classList.add("task-card", "card", "mb-3");
  // Set the card's id attribute
  card.setAttribute("id", `task-${task.id}`);
  // Make the card draggable
  card.setAttribute("draggable", "true");

  // Check the due date to add appropriate class for overdue or due soon tasks
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  if (dueDate < today) {
    card.classList.add("overdue");
  } else if (dueDate >= today) {
    card.classList.add("due-soon");
  }

  // Create the card body
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // Create and set the card title
  const cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  cardTitle.textContent = task.title;

  // Create and set the card description
  const cardText = document.createElement("p");
  cardText.classList.add("card-text");
  cardText.textContent = task.description;

  // Create and set the card due date
  const cardDueDate = document.createElement("p");
  cardDueDate.classList.add("card-text");
  cardDueDate.textContent = `Due: ${task.dueDate}`;

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.textContent = "Delete";
  // Set the delete button's click event to handle task deletion
  deleteButton.onclick = () => handleDeleteTask(task.id);

  // Append elements to the card body
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
  cardBody.appendChild(cardDueDate);
  cardBody.appendChild(deleteButton);
  // Append the card body to the card
  card.appendChild(cardBody);

  return card;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  // Get references to the swim lanes
  const todoLane = document.getElementById("todo-cards");
  const inProgressLane = document.getElementById("in-progress-cards");
  const doneLane = document.getElementById("done-cards");

  // Clear existing child elements from the swim lanes
  while (todoLane.firstChild) {
    todoLane.removeChild(todoLane.firstChild);
  }
  while (inProgressLane.firstChild) {
    inProgressLane.removeChild(inProgressLane.firstChild);
  }
  while (doneLane.firstChild) {
    doneLane.removeChild(doneLane.firstChild);
  }

  // Append new task cards to the appropriate swim lanes
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

  // Make the task cards draggable
  makeCardsDraggable();
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault(); // Prevent form submission
  // Get values from the form inputs
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const dueDate = document.getElementById("task-due-date").value;

  // Create a new task object
  const newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate,
    status: "to-do",
  };

  // Add the new task to the task list and save to localStorage
  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  // Re-render the task list and reset the form
  renderTaskList();
  document.getElementById("task-form").reset();
  // Hide the modal form
  $("#formModal").modal("hide");
}

// Create a function to handle deleting a task
function handleDeleteTask(taskId) {
  // Remove the task with the given id from the task list
  taskList = taskList.filter((task) => task.id !== taskId);
  // Save the updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
  // Re-render the task list
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Get the id of the dragged task
  const taskId = ui.draggable.attr("id").split("-")[1];
  // Get the new status from the drop target
  const newStatus = event.target.closest(".lane").id;

  // Update the task's status
  const task = taskList.find((task) => task.id == taskId);
  task.status = newStatus;

  // Save the updated task list to localStorage and re-render the task list
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Make task cards draggable
function makeCardsDraggable() {
  $(".task-card").draggable({
    revert: "invalid", // Revert to original position if not dropped in a valid droppable area
    helper: "clone", // Use a clone of the element being dragged
    start: function (event, ui) {
      $(this).addClass("dragging");
    },
    stop: function (event, ui) {
      $(this).removeClass("dragging");
    },
  });
}

// Make lanes droppable
function makeLanesDroppable() {
  $(".lane .card-body").droppable({
    accept: ".task-card", // Accept only elements with the class 'task-card'
    drop: handleDrop, // Handle the drop event
    hoverClass: "bg-secondary", // Class to add when a draggable is hovered over a droppable
  });
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList(); // Render the initial task list
  makeLanesDroppable(); // Make lanes droppable
  $("#task-due-date").datepicker(); // Initialize the date picker
  $("#task-form").on("submit", handleAddTask); // Add event listener to handle task form submission
});
