import { ExplorerLeaf } from './../@types/obsidian';
import IconColorPlugin from './main';

const folderClassName = "obsidian-color-folder";

function findAllMethods(obj: any) {
    return Object.getOwnPropertyNames(obj).filter(function (property) {
        return true;
        return typeof obj[property] == "function";
    });
}

export const addColorsToDOM = (plugin: IconColorPlugin, data: [string, string], registeredFileExplorers: WeakMap<ExplorerLeaf, boolean>,) => {
    //Get the file explorer instances.
    const fileExplorers = plugin.app.workspace.getLeavesOfType('file-explorer');
    //Walk through them.
    fileExplorers.forEach((fileExplorer: any) => {
        //If we've already dealt with this file explorer, skip.
        if (registeredFileExplorers.has(fileExplorer)) {
            //return;
        }
        //Set the state for the file explorer to show we've dealt with it.  
        registeredFileExplorers.set(fileExplorer, true);

        const method1 = plugin.getSettings().hierarchicalMode;
        if (method1) {

            // console.log("TYPE: " + (typeof fileExplorer.view.fileItems));
            // var meths = findAllMethods(fileExplorer.view.fileItems)
            var fileNames = Object.getOwnPropertyNames(fileExplorer.view.fileItems);
            for (let item of fileNames) {
                var hasColor = false;
                var dataKey = "";
                data.forEach(([key, value]) => {
                    if (item.startsWith(key)) {
                        hasColor = true;
                        dataKey = value;
                    }
                });
                if (hasColor) {
                    //Get the title element.
                    const fileItem = fileExplorer.view.fileItems[item];
                    const titleEl = fileItem.titleEl;
                    const titleInnerEl = fileItem.titleInnerEl;
                    applyStyleToElement(titleEl, titleInnerEl, dataKey);
                }
            }
        }
        else {
            //Walk through the data to set. 
            data.forEach(([key, value]) => {
                //Get the file item from the key.
                const fileItem = fileExplorer.view.fileItems[key];
                if (fileItem) {
                    //Get the title element.
                    const titleEl = fileItem.titleEl;
                    const titleInnerEl = fileItem.titleInnerEl;

                    applyStyleToElement(titleEl, titleInnerEl, value);
                }
            });
        }

    });
};

var applyStyleToElement = (parentElement: Element, insertBefore: Element, color: string) => {
    let iconNode: HTMLElement = null;
    if (!parentElement) {
        iconNode = <HTMLElement>document.createElement('div');
    }
    else {
        iconNode = <HTMLElement>parentElement.createDiv();
    }

    iconNode.classList.add(folderClassName);
    const insertIcon = false;
    if (insertIcon) {
        iconNode.innerHTML = `<div style=\"width: 10px; height: 10px; margin-top: 8px; background-color: ${color}\">&nbsp;</div>`;
    }
    parentElement.insertBefore(iconNode, insertBefore);
    //before is the titleInner El. It's either a nav-file-title-content, or a nav-folder-title-content'
    parentElement.setAttribute("style", `color: ${color}`);
}

export const removeFromDOM = (path: string) => {
    //Get all the nodes that match the path. 
    const node = document.querySelector(`[data-path="${path}"]`);
    if (!node) {
        console.error('element with data path not found', path);
        return;
    }

    //Get the node which represents the color node. 
    const iconNode = node.querySelector('.' + folderClassName);
    if (!iconNode) {
        console.error('icon element does not exist', path);
        return;
    }
    //Remove the node.
    iconNode.nextElementSibling.removeAttribute("style");
    iconNode.remove();

};

export const addToDOM = (path: string, color: string): void => {
    //Get the item with the data-path.
    const node = document.querySelector(`[data-path="${path}"]`);
    if (!node) {
        console.error('element with data path not found', path);
        return;
    }
    //Get the title node container.
    let titleNode = node.querySelector('.nav-folder-title-content');
    if (!titleNode) {
        titleNode = node.querySelector('.nav-file-title-content');

        if (!titleNode) {
            console.error('element with title not found');
            return;
        }
    }

    applyStyleToElement(node, titleNode, color);
};
