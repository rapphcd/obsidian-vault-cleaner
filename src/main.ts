import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";

export default class CleanupPlugin extends Plugin {
	settings: PluginSettings;
	cleanedFiles = 0;

	async onload() {
		await this.loadSettings();

		let ribbonIcon = this.addRibbonIcon("trash", "Clean vault", async (e: MouseEvent) => {
			await this.clickOnRibbon(e, ribbonIcon)
		})

		this.registerEvent(this.app.vault.on('create', () => {
			if (!ribbonIcon.isShown()) {
				ribbonIcon = this.addRibbonIcon("trash", "Clean vault", async (e: MouseEvent) => {
					await this.clickOnRibbon(e, ribbonIcon)
				})
			}
		}))

		this.registerEvent(this.app.vault.on('modify', () => {
			if (!ribbonIcon.isShown()) {
				ribbonIcon = this.addRibbonIcon("trash", "Clean vault", async (e: MouseEvent) => {
					await this.clickOnRibbon(e, ribbonIcon)
				})
			}
		}))


		this.addSettingTab(new SettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async clickOnRibbon(e: MouseEvent, icon: HTMLElement) {
		const statusElement = this.addStatusBarItem().createEl("span");
		this.cleanedFiles = 0;

		await this.cleanMediaFiles()
		if (this.settings.removeUntitled) {
			await this.cleanUntitled()
		}
		if(this.settings.removeDoubles){
			await this.cleanDoubles()
		}
		statusElement.setText(this.cleanedFiles <= 1 ? this.cleanedFiles.toString() + " File Cleaned" : this.cleanedFiles.toString() + " Files Cleaned")

		icon.detach()

		setTimeout(() => {
			statusElement.detach()
		}, 8000)
	}


	async cleanMediaFiles() {
		const markdownFiles = this.app.vault.getMarkdownFiles();

		const mediasFiles: (string | undefined)[] = [];

		for (const file of markdownFiles) {
			await this.app.vault.read(file).then((c) => {
				const rgex: RegExp = /!\[\[([^\]]+)\]\]/g;
				let found = [...c.matchAll(rgex)];
				if (found) {
					found.map(m => {
						if (!mediasFiles.contains(m[1])) {
							mediasFiles.push(m[1])
						}
					})
				}
			})
		}

		const allfiles = this.app.vault.getFiles();

		for (const file of allfiles) {

			if (file.extension != "md" && !mediasFiles.contains(file.name)) {
				this.cleanedFiles += 1;
				await this.app.fileManager.trashFile(file);
			}
		}
	}

	async cleanUntitled() {
		const markdownFiles = this.app.vault.getMarkdownFiles();

		for (const file of markdownFiles) {
			const fname = file.basename;
			const rg = /^Untitled(?: (?:[1-9][0-9]?[0-9]?[0-9]?))?$/;
			const untitled = rg.test(fname);

			if (untitled) {
				if (this.settings.excludeNonEmpty) {
					await this.app.vault.read(file).then(async (c) => {
						if (c === "") {
							this.cleanedFiles += 1;
							await this.app.fileManager.trashFile(file);
						}
					})
				} else {
					this.cleanedFiles += 1;
					await this.app.fileManager.trashFile(file);
				}
			}
		}
	}

	async cleanDoubles(){
		const markdownFiles = this.app.vault.getMarkdownFiles();

		const filesList = new Map<string, TFile>();

		for(const file of markdownFiles){
			const rg = /\s\(\d+\)$/;
			const basename = file.basename.replace(rg, "");

			if(!filesList.has(basename)){
				filesList.set(basename, file)
			} else {
				const stored = filesList.get(basename);

				if(stored == undefined ) return;

				let fileToDelete = stored;
				let fileToKeep = file;

				if(stored.stat.mtime > file.stat.mtime){
					fileToDelete = file;
					fileToKeep = stored;
				}

				filesList.set(basename, fileToKeep)
				this.cleanedFiles += 1;

				await this.app.fileManager.trashFile(fileToDelete);
			}
		}
	}
}
