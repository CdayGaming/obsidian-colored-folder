import { App, Editor, MarkdownView, Modal, Notice, Plugin, MenuItem, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_SETTINGS, FolderColorSettings } from './settings';
import { addColorsToDOM, removeFromDOM } from './util';
import { ColorPickerModal, ColorPickerModal1 } from './colorPickerModal';
import FolderColorSettingsTab from "./folderColorSettingsTab";


export default class FolderColorPlugin extends Plugin {
	private data: Record<string, string | Object>;
	private registeredFileExplorers = new WeakMap();

	async onload() {
		console.log('loading obsidian-color-folder');

		//Load the color data from the settings (.obsidian/plugins/)
		await this.loadFolderColorData();

		//Register for layout changes.
		this.app.workspace.onLayoutReady(() => this.handleChangeLayout());
		this.registerEvent(this.app.workspace.on('layout-change', () => this.handleChangeLayout()));
		this.handleChangeLayout();

		//Register the context menu commands.
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				const addColorMenuItem = (item: MenuItem) => {
					item.setTitle('Change color');
					//item.setIcon('hashtag');
					item.onClick(() => {
						let currentColor = "";
						if (this.data[file.path]) {
							currentColor = <string>this.data[file.path];
						}
						const modal = new ColorPickerModal1(this.app, this, file.path, currentColor);
						modal.open();
					});
				};

				//Remove the color command.
				const removeColorMenuItem = (item: MenuItem) => {
					item.setTitle('Remove color');
					//item.setIcon('trash');
					item.onClick(() => {
						this.removeFolderColor(file.path);
						removeFromDOM(file.path);
					});
				};

				menu.addItem(addColorMenuItem);
				menu.addItem(removeColorMenuItem);
			}),
		);

		//Register for file deletions.
		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				//Delete the path from the stored data
				const path = file.path;
				this.removeFolderColor(path);
			}),
		);

		//Register for file changes.
		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				this.renameFolder(file.path, oldPath);
			}),
		);

		//Add a settings tab.
		this.addSettingTab(new FolderColorSettingsTab(this.app, this));
	}

	//Method called when the layout changes.
	public handleChangeLayout(): void {
		//console.log('obsidian-color-folder handling layout change');
		const data = Object.entries(this.data) as [string, string];
		//Add all color to the DOM for any new file explorers.
		addColorsToDOM(this, data, this.registeredFileExplorers);
	}

	public save(): void {

	}

	//Called when the plugin is downloaded.
	onunload() {
		console.log('unloading obsidian-color-folder');
	}

	//Called when a file is renamed.
	renameFolder(newPath: string, oldPath: string): void {
		//Check the path has actually changed, and that we've got a stored color for it. 
		if (!this.data[oldPath] || newPath === oldPath) {
			return;
		}

		//Add the new path to our stored data. 
		Object.defineProperty(this.data, newPath, Object.getOwnPropertyDescriptor(this.data, oldPath));
		//Remove the old path from our stored data. 
		delete this.data[oldPath];
		//Store the folder color data.
		this.saveFolderColorData();
	}

	//Called when the context menu is clicked to remove color data.
	removeFolderColor(path: string): void {
		//Check we've got color data for this path.
		if (!this.data[path]) {
			return;
		}

		//If we do, delete it.
		delete this.data[path];
		//Save changes to the color data. 
		this.saveFolderColorData();
	}

	addFolderColor(path: string, color: string): void {
		//If there is already a color for this path.
		if (this.data[path]) {
			//Remove any existing color from the gui.
			removeFromDOM(path);
		}

		//Store the color in the data object.
		this.data[path] = color;
		//Save the color data. 
		this.saveFolderColorData();

		this.handleChangeLayout();
	}

	public getSettings(): FolderColorSettings {
		return this.data.settings as FolderColorSettings;
	}

	async loadFolderColorData(): Promise<void> {
		//Load the folder color from the file system.
		const data = await this.loadData();
		//Read the data into the object. 
		this.data = Object.assign({ settings: { ...DEFAULT_SETTINGS } }, {}, data);
	}

	async saveFolderColorData(): Promise<void> {
		//Save the folder color data object.
		await this.saveData(this.data);
	}

}
