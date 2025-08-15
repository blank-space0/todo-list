import { Task } from "./task.js";

export class TaskCollection {
    #tasks;

    constructor() {
        this.#tasks = {};
    }

    addTask(notes, id = null) {
        const newId = id ? id : crypto.randomUUID();
        const task = new Task(newId, notes);
        this.#tasks[newId] = task;
        return newId; 
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