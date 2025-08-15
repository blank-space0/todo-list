import "./styles.css";
import { ModifyDom } from "./ui/modifyDom.js";
import { StorageService } from "./utils/storageService.js";

document.addEventListener("DOMContentLoaded", () => {
    const cache = new StorageService();
    const load = cache.downloadCache(true);
    const app = new ModifyDom();

    if (cache) {
        cache.repopulate(load, app);
    }
});



// local storage for page reload

// 1. store all data locally
//
//
