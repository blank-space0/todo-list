import "./styles.css";
import { ModifyDom } from ".//ui/modifyDom.js";

document.addEventListener("DOMContentLoaded", () => {
    const start = new ModifyDom();
});

// bugs
// when we create multiple projects, then delete one
// we need to have the UI go back and open one of the other available project tabs
// otherwise, if we try to add task, we get an error message (no projectID in scope!)
// just check and see if we have one in the DOM
// if so, just open up the first one and populate

// local storage
// on page reload, everything is wiped
// so we need an event listener to check for page load/reload
// on load, we check our storage to see if anything is in it
// if it is, we load it in, populate the dom, and get our state back
// we also need to remember what the last ProjectID was, so store that as well
// thats so we can have the last tab open that the user was on