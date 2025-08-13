import { TaskCollection } from "./taskCollection.js";

export class Project {
    constructor(name, id) {
        this.name = name; 
        this.id = id;    
        this.collection = new TaskCollection(); 
    }
}