import { App, PluginSettingTab, Setting } from 'obsidian';
import FolderColorPlugin from './main';

export default class FolderColorSettingsTab extends PluginSettingTab {
    plugin: FolderColorPlugin;

    constructor(app: App, plugin: FolderColorPlugin) {
        super(app, plugin);

        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Colored Folder Settings' });

        // new Setting(containerEl)
        //     .setName('Enable Experimental Mode')
        //     .setDesc('Enables experimental model')
        //     .addToggle((toggle) => {
        //         // toggle.setValue(this.plugin.getSettings().enableRemixiconsLine).onChange(async (val) => {
        //         //     this.plugin.getSettings().enableRemixiconsLine = val;
        //         //     await this.plugin.saveIconFolderData();
        //         // });
        //     });
        new Setting(containerEl)
            .setName('Hierarchical Mode')
            .setDesc('In `Hierarchical Mode`, child folders are colored based on parent settings.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.getSettings().hierarchicalMode).onChange(async (val) => {
                    this.plugin.getSettings().hierarchicalMode = val;
                    await this.plugin.saveFolderColorData();
                    this.plugin.handleChangeLayout();
                });
            });

    }
}
