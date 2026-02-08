import {App, PluginSettingTab, Setting} from "obsidian";
import CleanupPlugin  from "./main";

export interface PluginSettings {
	removeUntitled: boolean;
    removeDoubles: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	removeUntitled: false,
    removeDoubles: false
}

export class SettingTab extends PluginSettingTab {
	plugin: CleanupPlugin;

	constructor(app: App, plugin: CleanupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Remove Untitled')
			.setDesc('Removes utitled leafs.')
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeUntitled)
                .onChange( async (val) => {
                    this.plugin.settings.removeUntitled = val;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
			.setName('Remove Doubles')
			.setDesc('Removes double leafs.')
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.removeDoubles)
                .onChange( async (val) => {
                    this.plugin.settings.removeDoubles = val;
                    await this.plugin.saveSettings();
                })
            )
	}
}