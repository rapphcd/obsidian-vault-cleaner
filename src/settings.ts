import {App, PluginSettingTab, Setting} from "obsidian";
import CleanupPlugin  from "./main";
import {node} from "globals";

export interface PluginSettings {
	removeUntitled: boolean;
    removeDoubles: boolean;
	excludeNonEmpty: boolean;
	ignoredExtensions: string[];
}

export const DEFAULT_SETTINGS: PluginSettings = {
	removeUntitled: false,
    removeDoubles: false,
	excludeNonEmpty: false,
	ignoredExtensions: ["canvas", "base"]
}

export class SettingTab extends PluginSettingTab {
	plugin: CleanupPlugin;

	constructor(app: App, plugin: CleanupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		let val = "";

		containerEl.empty();

		new Setting(containerEl)
			.setName('Remove untitled')
			.setDesc('Remove untitled leafs.')
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeUntitled)
                .onChange( async (val) => {
                    this.plugin.settings.removeUntitled = val;
                    await this.plugin.saveSettings();
					this.display();
                })
            )
		
		if(this.plugin.settings.removeUntitled){
			new Setting(containerEl)
			.setName('Exclude non-empty')
			.setDesc('Exclude non-empty untitled files from deletion.')
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.excludeNonEmpty)
                .onChange( async (val) => {
                    this.plugin.settings.excludeNonEmpty = val;
                    await this.plugin.saveSettings();
                })
            )
		}

        new Setting(containerEl)
			.setName('Remove doubles')
			.setDesc('Removes duplicated leafs from the vault.')
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeDoubles)
                .onChange( async (val) => {
                    this.plugin.settings.removeDoubles = val;
                    await this.plugin.saveSettings();
                })
            )

		containerEl.appendChild(containerEl.createEl("hr"))

		new Setting(containerEl)
			.setName("Ignored extensions")
			.setHeading()
			.setDesc(`Files with theses extensions won't be deleted during the "unused medias" deletion.`)

		new Setting(containerEl)
			.setName("Add ignored extension")
			.setDesc(`Ex: "pdf"`)
			.addText(text => text
				.setValue(val)
				.onChange(value => {
					val = value;
				}))
			.addButton(button => button
				.setIcon("check")
				.onClick(async (e) => {
					if(val == "") return;
					this.plugin.settings.ignoredExtensions.push(val);
					await this.plugin.saveSettings();
					this.display();
				})
			)

		for (const ext of this.plugin.settings.ignoredExtensions){
			new Setting(containerEl)
				.setName(`.${ext}`)
				.addButton(b => b
					.setIcon("trash")
					.onClick(async (event) => {
						this.plugin.settings.ignoredExtensions = this.plugin.settings.ignoredExtensions.filter((e) => e != ext);
						await this.plugin.saveSettings();
						this.display();
					}))
		}
	}
}
