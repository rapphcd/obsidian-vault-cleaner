import { Plugin } from 'obsidian';


export default class CleanupPlugin extends Plugin {
	cleanedFiles = 0;

	async onload() {

		let ribbonIcon = this.addRibbonIcon("trash", "Clean medias", (e: MouseEvent) => {
			this.clickOnRibbon(e, ribbonIcon)
		})

		this.registerEvent(this.app.vault.on('create', () => {
			if (!ribbonIcon.isShown()) {
				ribbonIcon = this.addRibbonIcon("trash", "Clean medias", (e: MouseEvent) => {
					this.clickOnRibbon(e, ribbonIcon)
				})
			}
		}))

	}

	clickOnRibbon(e: MouseEvent, icon: HTMLElement) {
		const statusElement = this.addStatusBarItem().createEl("span")

		this.cleanMediaFiles()
		statusElement.setText(this.cleanedFiles.toString() + " File Cleaned")

		icon.detach()

		setTimeout(() => {
			statusElement.detach()
		}, 8000)
	}


	cleanMediaFiles() {
		this.cleanedFiles = 0
		const filesList = this.app.vault.getFiles();
		for (const file of filesList) {
			if (file.extension != "md") {
				this.cleanedFiles += 1;
				//clean
			}
		}
	}
}