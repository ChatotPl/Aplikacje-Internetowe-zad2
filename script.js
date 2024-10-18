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
    }

    task_form() {

        const box = document.createElement("div");
        box.id = "box";
        box.style.position = "absolute";
        box.style.border = "1px solid black";
        box.style.padding = "10px";
        box.style.display = "flex";
        box.style.flexDirection = "column";

        const search=document.createElement("textarea");
        const task_area=document.createElement("div");
        task_area.style.height="300px";
        task_area.style.width="500px";

        const task_name = document.createElement("textarea");
        const task_data = document.createElement("input")
        task_data.type = "date";
        const save_button = document.createElement("button");
        save_button.innerHTML = "Save";



        search.addEventListener('input', (event) =>{
            searching();
        })

        function searching(){


            this.tasks.forEach(task =>{
            const task_frame=document.createElement("div");
            div.id=this.tasks[task];
            task_area.appendChild(task_frame);
            });

        }


        function validation() {
            if (task_name.value.textLength < 3 || task_name.value.textLength > 255) {
                return false;
            }
            if (new Date(task_data.value) < new Date()) {
                return false;
            }
            return true;
        }


        save_button.addEventListener("click", () => {
            if (validation()) {
                const new_task = new Task(task_name.value, task_data.value, "work")
                this.tasks.push(new_task);
            } else {
                alert("Błędnie wprowadzony task");

            }
        })

        document.body.appendChild(box);
        box.appendChild(search);
        box.appendChild(task_area);
        box.appendChild(task_name);
        box.appendChild(task_data);
        box.appendChild(save_button);

    }
}

document.app = new TodoApplication();

document.app.task_form();




