export class ProjectManager {
    constructor() {
        this.projects = {};
    }

    get() {
        return this.projects;
    }

    addProject(project) {
        this.projects[project.id] = project;
    }

    removeProject(id) {
        delete this.projects[id];
    }
}