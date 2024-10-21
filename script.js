class Task {
    constructor(name, data, stat) {
        this.name = name || " ";
        this.data = data || " ";
        this.stat = stat || " ";
    }
}

class TodoApplication {
    constructor() {
        this.tasks = [];
        this.currentEditingTaskIndex = null; // Keeps track of the currently editing task index
        this.loadTasksFromLocalStorage(); // Load tasks from local storage on initialization
    }

    // Load tasks from local storage
    loadTasksFromLocalStorage() {
        const tasksJSON = localStorage.getItem("tasks");
        if (tasksJSON) {
            const parsedTasks = JSON.parse(tasksJSON);
            this.tasks = parsedTasks.map(task => new Task(task.name, task.data, task.stat)); // Map to Task instances
        }
    }

    // Save tasks to local storage
    saveTasksToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks)); // Convert tasks array to JSON and save
    }

    task_form() {
        const box = document.createElement("div");
        box.id = "box";
        box.style.position = "absolute";
        box.style.border = "1px solid black";
        box.style.padding = "10px";
        box.style.display = "flex";
        box.style.flexDirection = "column";

        const search = document.createElement("textarea");
        const task_area = document.createElement("div");
        task_area.id = "task_area"; // Give task_area an ID for easier reference
        task_area.style.height = "300px";
        task_area.style.width = "500px";
        task_area.style.overflowY = "auto"; // Allow scrolling if there are many tasks

        const task_name = document.createElement("textarea");
        const task_data = document.createElement("input");
        task_data.type = "date";
        const save_button = document.createElement("button");
        save_button.innerHTML = "Save";

        // Event listener for searching tasks
        search.addEventListener('input', (event) => {
            this.searching(task_area, search.value); // Pass task_area and search value to the searching function
        });

        // Function to search tasks
        this.searching = (task_area, query) => {
            task_area.innerHTML = ''; // Clear previous tasks before updating

            // Only start filtering when at least 2 characters are entered
            if (query.length >= 2) {
                this.tasks
                    .filter(task => task.name.toLowerCase().includes(query.toLowerCase())) // Case-insensitive filtering
                    .forEach((task, index) => {
                        const task_frame = this.createTaskFrame(task, index, query); // Pass query for highlighting
                        task_area.appendChild(task_frame);
                    });
            } else {
                // Display all tasks if the query is less than 2 characters
                this.tasks.forEach((task, index) => {
                    const task_frame = this.createTaskFrame(task, index, ""); // No highlighting
                    task_area.appendChild(task_frame);
                });
            }
        };

        // Create a task frame for display
        this.createTaskFrame = (task, index, query) => {
            const task_frame = document.createElement("div");
            const highlighted_task_name = this.highlightMatch(task.name, query); // Highlight the matching part
            task_frame.innerHTML = `${highlighted_task_name} - ${task.data} - ${task.stat}`;
            task_frame.style.cursor = "pointer"; // Change cursor to pointer for better UX

            // Create and append trash can emoji for deletion
            const deleteButton = document.createElement("span");
            deleteButton.innerHTML = "🗑️"; // Trash can emoji
            deleteButton.style.cursor = "pointer"; // Change cursor to pointer for the emoji
            deleteButton.style.marginLeft = "10px"; // Space between task and emoji

            // Event listener for deleting a task
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the click from bubbling up
                this.deleteTask(index); // Call the delete task function
            });

            task_frame.appendChild(deleteButton); // Add the emoji to the task frame

            // Add click event for editing
            task_frame.addEventListener('click', () => this.editTask(index, task_frame));
            return task_frame;
        };

        // Function to highlight the matching fragment
        this.highlightMatch = (taskName, query) => {
            // Only highlight if a query is provided (i.e., filter is active)
            if (query.length >= 2) {
                const regex = new RegExp(`(${query})`, 'gi'); // Case-insensitive regex to match the query
                return taskName.replace(regex, '<span style="background-color: yellow;">$1</span>'); // Wrap match in a span
            }
            return taskName; // Return the original task name if no query
        };

        // Function to delete a task
        this.deleteTask = (index) => {
            this.tasks.splice(index, 1); // Remove the task from the tasks array
            const task_area = document.getElementById("task_area"); // Use the specific ID
            this.saveTasksToLocalStorage(); // Save updated tasks to local storage
            this.searching(task_area, ""); // Refresh the task area
        };

        // Function to edit a task
        this.editTask = (index, task_frame) => {
            // Prevent editing if another task is already being edited
            if (this.currentEditingTaskIndex !== null) {
                alert("A task is currently being edited. Please finish editing before editing another task.");
                return;
            }

            this.currentEditingTaskIndex = index; // Set the current editing task index
            const task = this.tasks[index];

            // Replace the task frame with input fields for editing
            task_frame.innerHTML = '';

            const edit_name = document.createElement("textarea");
            edit_name.value = task.name;
            edit_name.style.width = "200px"; // Adjust width as needed

            const edit_data = document.createElement("input");
            edit_data.type = "date";
            edit_data.value = task.data;

            // Prevent triggering editing on clicking these inputs
            edit_name.addEventListener("click", (event) => {
                event.stopPropagation();
            });
            edit_data.addEventListener("click", (event) => {
                event.stopPropagation();
            });

            // Append the input fields to the task frame
            task_frame.appendChild(edit_name);
            task_frame.appendChild(edit_data);

            // Focus on the name field
            edit_name.focus();

            // Outside click listener for saving changes
            const outsideClickListener = (event) => {
                // Check if the click is outside the task frame
                if (!task_frame.contains(event.target)) {
                    if (this.validation(edit_name, edit_data)) {
                        // Update the task
                        this.tasks[index] = new Task(edit_name.value, edit_data.value, task.stat);
                        this.saveTasksToLocalStorage(); // Save updated tasks to local storage
                        this.searching(document.getElementById("task_area"), ""); // Refresh the task area
                    } else {
                        alert("Błędnie wprowadzony task");
                    }
                    this.currentEditingTaskIndex = null; // Reset the editing task index
                    document.removeEventListener("click", outsideClickListener); // Remove the outside click listener
                }
            };

            document.addEventListener("click", outsideClickListener); // Add outside click listener
        };

        // Validation function
        this.validation = (nameField, dateField) => {
            if (nameField.value.length < 3 || nameField.value.length > 255) {
                return false;
            }
            if (new Date(dateField.value) < new Date()) {
                return false;
            }
            return true;
        };

        // Save button for adding new tasks
        save_button.addEventListener("click", () => {
            if (this.validation(task_name, task_data)) {
                const new_task = new Task(task_name.value, task_data.value, "work");
                this.tasks.push(new_task); // Add the new task to the tasks array
                this.saveTasksToLocalStorage(); // Save updated tasks to local storage
                this.searching(task_area, search.value); // Update task area after adding a new task
                task_name.value = ''; // Clear task name field
                task_data.value = ''; // Clear task date field
            } else {
                alert("Błędnie wprowadzony task");
            }
        });

        // Append elements to the box
        document.body.appendChild(box);
        box.appendChild(search);
        box.appendChild(task_area);
        box.appendChild(task_name);
        box.appendChild(task_data);
        box.appendChild(save_button);

        // Display saved tasks immediately after initialization
        this.searching(task_area, ""); // Show all tasks loaded from local storage
    }
}

document.app = new TodoApplication();
document.app.task_form();
