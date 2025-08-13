import { Task } from "./task.js";

export class TaskCollection {
    #tasks;

    constructor() {
        this.#tasks = {};
    }

    addTask(notes) {
        const id = crypto.randomUUID();
        const task = new Task(id, notes);
        this.#tasks[id] = task;
        return id; 
    }

    removeTask(id) {
        if (id in this.#tasks) {
            delete this.#tasks[id];
            return true;
        }
        return false; 
    }

    getTask(id) {
        return this.#tasks[id] ?? null; 
    }

    listTasks() {
        return Object.values(this.#tasks); 
    }
}