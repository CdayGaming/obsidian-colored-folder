import { App, FuzzyMatch, FuzzySuggestModal, Modal, Setting, TextComponent } from 'obsidian';
import FolderColorPlugin from './main';
import { addToDOM } from './util';

//See https://github.com/valentine195/obsidian-admonition/blob/master/src/modal/index.ts

export class ColorPickerModal1 extends Modal {
    public color: string;
    private plugin: FolderColorPlugin;
    private path: string;

    constructor(app: App, plugin: FolderColorPlugin, path: string, color: string) {
        super(app);
        this.plugin = plugin;
        this.path = path;
        this.color = color;

        this.containerEl.addClass("obsidian-color-folder-modal");
    }

    onOpen() {
        const { contentEl } = this;
        this.display(true);
    }

    onClose() {
        const { contentEl } = this;
        const col = this.color;

        addToDOM(this.path, col);
        this.plugin.addFolderColor(this.path, col);

        contentEl.empty();
    }

    private async display(focus?: boolean) {
        const { contentEl } = this;
        contentEl.empty();
        let titleInput: TextComponent;

        const titleSetting = new Setting(contentEl);
        titleSetting
            .setName("Color")
            .setDesc("Leave blank to render without a title.")
            .addText((t) => {
                titleInput = t;
                t.setValue(this.color);

                t.onChange((v) => {
                    this.color = v;
                });

                titleInput.inputEl.onkeydown = (evt) => {
                    evt.key == "Enter" && this.close();
                };
            });

        new Setting(contentEl)
            .addButton((b) =>
                b
                    .setButtonText("Insert")
                    .setCta()
                    .onClick(() => {
                        this.close();
                    })
            )
            .addExtraButton((b) => {
                b.setIcon("cross")
                    .setTooltip("Cancel")
                    .onClick(() => this.close());
                b.extraSettingsEl.setAttr("tabindex", 0);
                b.extraSettingsEl.onkeydown = (evt) => {
                    evt.key == "Enter" && this.close();
                };
            });

        if (focus) {
            titleInput.inputEl.focus();
        }

    }
}

export class ColorPickerModal extends FuzzySuggestModal<any> {
    private plugin: FolderColorPlugin;
    private path: string;

    constructor(app: App, plugin: FolderColorPlugin, path: string) {
        super(app);
        this.plugin = plugin;
        this.path = path;
    }

    onOpen() {
        super.onOpen();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    getItemText(item: string): string {
        //Abstract override.
        return item;
    }

    getItems(): string[] {
        return [];
    }

    onChooseItem(item: string): void {
        addToDOM(this.path, item);
        this.plugin.addFolderColor(this.path, item);
    }

    renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
        super.renderSuggestion(item, el);

        if (item.item !== 'default') {
            el.innerHTML += `<div class="obsidian-icon-folder-icon-preview" style="background-color: ${item.item}">&nbsp;</div>`;
        }
    }
}
