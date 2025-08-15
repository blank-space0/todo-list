import { ProjectManager } from "../models/projectManager.js";
import { Project } from "../models/project.js";
import { StorageService } from "../utils/storageService.js";

export class ModifyDom {
    constructor() {
        this.addProjectBtn = document.getElementById("add-project");
        this.addTask = document.getElementById("add-task");
        this.projectManager = new ProjectManager();
        this.currentProjectId = null;
        this.storage = new StorageService();

        this.init();
    }

    init() {
        this.addProjectBtn.addEventListener("click", this.showProjectInput);
        this.addTask.addEventListener("click", this.showTaskInput)
    }

    updateCache() {
        this.storage.cacheData(this.projectManager, this.currentProjectId);
    }

    // we have to make this an arrow function so we dont loose this
    showProjectInput = () => {
        const prevDisplay = this.addProjectBtn.dataset.prevDisplay || getComputedStyle(this.addProjectBtn).display;
        this.addProjectBtn.dataset.prevDisplay = prevDisplay;
        this.addProjectBtn.style.display = "none";

        const form = document.createElement("form");

        const label = document.createElement("label");
        label.htmlFor = "project-name";
        label.setAttribute("aria-label", "Input project name");

        const input = document.createElement("input");
        input.id = "project-name";
        input.type = "text";
        input.className = "project-input";
        input.name = "project-name";
        input.minLength = 1;
        input.maxLength = 10;
        input.required = true;

        const btnContainer = document.createElement("div");
        const subBtn = document.createElement("button");
        const clearBtn = document.createElement("button");

        btnContainer.className = "form-buttons";
        subBtn.type = "submit";
        subBtn.className = "sub-form";
        subBtn.textContent = "Add";
        clearBtn.type = "button";
        clearBtn.className = "clear-form";
        clearBtn.textContent = "Clear";

        btnContainer.append(subBtn, clearBtn);
        form.append(label, input, btnContainer);

        this.addProjectBtn.insertAdjacentElement("beforebegin", form); // put the form in its place
        input.focus(); // brings into focus so user can just start typing without clicking on it

        const cleanup = () => {
            form.remove();
            this.addProjectBtn.style.display = prevDisplay;
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = input.value.trim();
            this.addNewProject(name);
            cleanup();
        });

        clearBtn.addEventListener("click", cleanup);

    };

    showTaskInput = () => {
        const prevDisplay = this.addTask.dataset.prevDisplay || getComputedStyle(this.addTask).display;
        this.addTask.dataset.prevDisplay = prevDisplay;
        this.addTask.style.display = "none";

        const form = document.createElement("form");
        const label = document.createElement("label");
        const input = document.createElement("input");
        const btnContainer = document.createElement("div");
        const submitBtn = document.createElement("button");
        const clearBtn = document.createElement("button");

        form.id = "task-form";

        label.htmlFor = "task-input";
        label.setAttribute("aria-label", "Input your task here");

        input.type = "text";
        input.name = "task-description";
        input.id = "task-input";
        input.minLength = 1;
        input.maxLength = 50;
        input.required = true;
        
        btnContainer.className = "task-buttons";

        submitBtn.type = "submit";
        submitBtn.id = "task-submit";
        submitBtn.textContent = "Submit";

        clearBtn.type = "button";
        clearBtn.id = "task-clear";
        clearBtn.textContent = "Clear";

        btnContainer.append(submitBtn, clearBtn);
        form.append(label, input, btnContainer);

        this.addTask.insertAdjacentElement("beforebegin", form);
        input.focus();

        const cleanup = () => {
            form.remove();
            this.addTask.style.display = prevDisplay;
        };

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const description = input.value.trim();
            this.addNewTask(description);
            cleanup();
        });

        clearBtn.addEventListener("click", cleanup);

    };

    addNewProject(name) {
        const ulParent = document.querySelector(".nav-list")
        const liElement = document.createElement("li")
        const projBox = document.createElement("div");
        const checkImg = document.createElement("span");
        const projSwap = document.createElement("button"); // will need to add event listner to delete later
        const projRemove = document.createElement("button");
        const removeImg = document.createElement("span");

        // actually add the project to our ProjectManager
        let newProject = new Project(name, crypto.randomUUID());
        projSwap.dataset.id = newProject.id; 
        this.projectManager.addProject(newProject);
        this.swapProjectId(newProject.id); // make this the current project in focus on creation
        this.populateTaskList(newProject.id);

        projBox.className = "style-help";

        checkImg.className = "material-symbols-outlined";
        checkImg.textContent = "checklist";

        projSwap.type = "button";
        projSwap.className = "project-swap";
        projSwap.textContent = name;
        projSwap.addEventListener("click", () => { 
            this.swapProjectId(newProject.id); // brings whatever project we click into focus
            this.populateTaskList(newProject.id) 
        }); // some method that switches our project tabs for us

        projBox.append(checkImg, projSwap);

        projRemove.type = "button";
        projRemove.className = "project-close";

        removeImg.className = "material-symbols-outlined";
        removeImg.textContent = "close_small";

        projRemove.appendChild(removeImg);
        liElement.append(projBox, projRemove);
        ulParent.appendChild(liElement);

        projRemove.addEventListener("click", () => { 
            const wasCurrent = this.currentProjectId === newProject.id; 
            this.removeProject(liElement, newProject.id) 

            if (!wasCurrent) {
                return;
            }

            // check to see if we have another project, just switch to the very first one we have
            const projectList = this.projectManager.get();

            if (Object.keys(projectList).length > 0) {
                const first = Object.values(projectList)[0];
                this.currentProjectId = first.id;
                this.populateTaskList(this.currentProjectId);

            } else {
                this.currentProjectId = null;
                const taskList = document.getElementById("task-list");
                taskList?.replaceChildren(); // call this if taskList is not null
            }
            
        }); 

        // update on project add
        this.updateCache();
    }

    addNewTask(description) {
        // add task to the collection of the current project
        // then just call populateTaskList with the current id of the proj.
        const currId = this.currentProjectId;
        if (!currId) {
            alert("Must create a project first before adding a task!");
            return;
        }

        this.projectManager.projects[currId].collection.addTask(description);
        this.populateTaskList(currId);
        // update cache on task add
        this.updateCache();
    }

    removeProject(liElement, id) {
        liElement.remove();
        this.projectManager.removeProject(id);
        // update cache on remove
        this.updateCache();
    }

    removeTask(liElement, taskId) {
        const currProj = this.currentProjectId;
        this.projectManager.projects[currProj].collection.removeTask(taskId);
        liElement.remove();
        // update the cache on task remove
        this.updateCache();
    }

    swapProjectId(id) {
        this.currentProjectId = id;
    }

    populateTaskList(id) {
        const tasks = this.projectManager.projects[id].collection.listTasks(); // get all the tasks as an array
        const taskList = document.getElementById("task-list");
        taskList.replaceChildren();

        for (const task of tasks) {
            this.createTaskElement(task, taskList);
        }
    }

    createTaskElement(task, taskList) {
        const liElement = document.createElement("li");
        const circle = document.createElement("div");
        const description = document.createElement("div");

        circle.className = "circle";
        description.className = "proj-description";
        description.textContent = task.notes;

        liElement.append(circle, description);
        taskList.appendChild(liElement);

        // add event listener to remove task if user clicks on the circle!
        circle.addEventListener("click", () => {
            this.removeTask(liElement, task.id);
        });
    }

}

