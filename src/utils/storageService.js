export class StorageService {
    cacheData(projectManager, currentProjectId) {
        const writeData = {"currentProjectId": currentProjectId};
        let projectList = [];

        for (const project of Object.values(projectManager.projects)) {
            const currProj = {
                id: project.id,
                name: project.name,
                tasks: []
            };

            const tasks = project?.collection?.listTasks?.() || [];
            for (const task of tasks) {
                currProj.tasks.push({
                    id: task.id,
                    notes: task.notes
                });
            }

            projectList.push(currProj)
        }

        writeData["projects"] = projectList;
        sessionStorage.setItem("myProjects", JSON.stringify(writeData));

        // debugging only
        this.downloadCache(true);
    }
    
    downloadCache(log = false) {
        const readData = sessionStorage.getItem("myProjects");
        if (!readData) {
            return null;
        }

        // might not be valid json, lets check
        try {
            const parsed = JSON.parse(readData);
            if (log) {
                console.log(JSON.stringify(parsed, null, 2));
            }

            return parsed;
        } catch (exception) {
            console.warn("Invalid cache:", exception);
            return null;
        }
    }

    repopulate(cache, app) {
        // check if we have a cache, or if we have any projects to populate it
        if (!cache || !Array.isArray(cache.projects)) {
            return;
        }

        const rehydrate = true;
        for (const project of cache.projects) {
            const name = project.name;
            const id = project.id;
            app.addNewProject(name, id, rehydrate)
            app.swapProjectId(id, false);
            
            for (const task of project.tasks) {
                const taskId = task.id;
                const notes = task.notes;
                app.addNewTask(notes, taskId, rehydrate);
            }
        }

        const exists = cache.currentProjectId && app.projectManager.projects[cache.currentProjectId];
        app.currentProjectId = exists
            ? cache.currentProjectId
            : Object.values(app.projectManager.projects)[0]?.id ?? null;

        if (app.currentProjectId) {
            app.populateTaskList(app.currentProjectId);
        } else {
            document.getElementById("task-list")?.replaceChildren();
        }

        app.updateCache();
    }
}