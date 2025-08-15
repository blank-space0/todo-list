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
        this.addProjectBtn?.addEventListener("click", this.showProjectInput);
        this.addTask?.addEventListener("click", this.showTaskInput);
    }

    updateCache() {
        this.storage.cacheData(this.projectManager, this.currentProjectId);
    }

    // we have to make this an arrow function so we dont lose this
    showProjectInput = () => {
        const prevDisplay = this.addProjectBtn.dataset.prevDisplay || getComputedStyle(this.addProjectBtn).display;
        this.addProjectBtn.dataset.prevDisplay = prevDisplay;
        this.addProjectBtn.style.display = "none";

        const form = document.createElement("form");

        const label = document.createElement("label");
        label.htmlFor = "project-name";
        label.textContent = "Project name";

        const input = document.createElement("input");
        input.id = "project-name";
        input.type = "text";
        input.className = "project-input";
        input.name = "project-name";
        input.minLength = 1;
        input.maxLength = 20;
        input.required = true;
        input.setAttribute("aria-label", "Project name");

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

        this.addProjectBtn.insertAdjacentElement("beforebegin", form);
        input.focus();

        const cleanup = () => {
            form.remove();
            this.addProjectBtn.style.display = prevDisplay;
        };

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.reportValidity()) {
                return;
            }
            
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
        label.textContent = "Task description";

        input.type = "text";
        input.name = "task-description";
        input.id = "task-input";
        input.minLength = 1;
        input.maxLength = 150;
        input.required = true;
        input.setAttribute("aria-label", "Task description");

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
            if (!form.reportValidity()) return;
            const description = input.value.trim();
            this.addNewTask(description);
            cleanup();
        });

        clearBtn.addEventListener("click", cleanup);
    };

    addNewProject(name, passId = null, reHydrate = false) {
        const ulParent = document.querySelector(".nav-list");
        if (!ulParent) return;

        const liElement = document.createElement("li");
        const projBox = document.createElement("div");
        const checkImg = document.createElement("span");
        const projSwap = document.createElement("button");
        const projRemove = document.createElement("button");
        const removeImg = document.createElement("span");

        // actually add the project to our ProjectManager
        const newProjectId = passId ? passId : crypto.randomUUID();
        const newProject = new Project(name, newProjectId);
        projSwap.dataset.id = newProject.id;
        this.projectManager.addProject(newProject);

        // on normal flow, focus the new project and render; skip during hydration
        if (!reHydrate) {
            this.swapProjectId(newProject.id); // persists
            this.populateTaskList(newProject.id);
        }

        projBox.className = "style-help";

        checkImg.className = "material-symbols-outlined";
        checkImg.textContent = "checklist";

        projSwap.type = "button";
        projSwap.className = "project-swap";
        projSwap.textContent = name;
        projSwap.addEventListener("click", () => {
            this.swapProjectId(newProject.id); // brings whatever project we click into focus (persists)
            this.populateTaskList(newProject.id);
        });

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
            this.removeProject(liElement, newProject.id);

            if (!wasCurrent) {
                // projects changed, but current pointer didn't; still persist
                this.updateCache();
                return;
            }

            // choose a new current project (first available) or clear
            const projectList = this.projectManager.get();
            if (Object.keys(projectList).length > 0) {
                const first = Object.values(projectList)[0];
                this.currentProjectId = first.id;
                this.populateTaskList(this.currentProjectId);
            } else {
                this.currentProjectId = null;
                const taskList = document.getElementById("task-list");
                taskList?.replaceChildren();
            }
            // persist after all mutations
            this.updateCache();
        });

        // no extra write here; swapProjectId handled persistence for non-hydration flow
    }

    addNewTask(description, taskId = null, reHydrate = false) {
        const currId = this.currentProjectId;
        if (!currId) {
            alert("Must create a project first before adding a task!");
            return;
        }

        if (!taskId) {
            this.projectManager.projects[currId].collection.addTask(description);
        } else {
            this.projectManager.projects[currId].collection.addTask(description, taskId);
        }

        // avoid UI thrash during hydration; render once at the end of repopulate
        if (!reHydrate) {
            this.populateTaskList(currId);
            this.updateCache();
        }
    }

    removeProject(liElement, id) {
        liElement.remove();
        this.projectManager.removeProject(id);
    }

    removeTask(liElement, taskId) {
        const currProj = this.currentProjectId;
        this.projectManager.projects[currProj].collection.removeTask(taskId);
        liElement.remove();
        this.updateCache();
    }

    swapProjectId(id, persist = true) {
        this.currentProjectId = id;
        if (persist) {
            this.updateCache();
        }
    }

    populateTaskList(id) {
        const taskList = document.getElementById("task-list");
        if (!taskList) {
            return;
        }

        const tasks = this.projectManager.projects[id].collection.listTasks();
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

        circle.addEventListener("click", () => {
            this.removeTask(liElement, task.id);
        });
    }
}