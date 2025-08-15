export class StorageService {
    constructor() {
        
    }

    cacheData(projectManager, currentProjectId) {
        // session storage only stores strings
        // convert to string first
        // convert the projectCollection
        // then for each project, we need to convert its task list as well
        const writeData = {"currentProjectId": currentProjectId};
        let projectList = [];

        for (const [k, project] of Object.entries(projectManager.projects)) {
            let currProj = {};
            currProj["id"] = project.id;
            currProj["name"] = project.name;
            
            let tasks = project.collection.listTasks();
            let inner = [];
            for (const task of tasks) {
                let obj = {id: task.id,  notes: task.notes};
                inner.push(obj);
            }

            currProj.tasks = inner;
            projectList.push(currProj)
        }

        writeData["projects"] = projectList;
        const writeStr = JSON.stringify(writeData);
        sessionStorage.setItem("myProjects", writeStr);
        let check = sessionStorage.getItem("myProjects");
        console.log(check);
    } 

}