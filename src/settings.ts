import { App, PluginSettingTab, Setting } from 'obsidian';
import { MD2ResumeSettings } from './types';
import type MD2ResumePlugin from './main';

export class MD2ResumeSettingTab extends PluginSettingTab {
	plugin: MD2ResumePlugin;

	constructor(app: App, plugin: MD2ResumePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'MD2Resume Settings' });

		new Setting(containerEl)
			.setName('Font family')
			.setDesc('CSS font-family for the resume.')
			.addText(t => t
				.setValue(this.plugin.settings.fontFamily)
				.onChange(async v => {
					this.plugin.settings.fontFamily = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Font size')
			.setDesc('CSS font size (e.g. 10pt, 11px).')
			.addText(t => t
				.setValue(this.plugin.settings.fontSize)
				.onChange(async v => {
					this.plugin.settings.fontSize = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Page margin')
			.setDesc('Print margin (e.g. 0.6in, 15mm).')
			.addText(t => t
				.setValue(this.plugin.settings.pageMargin)
				.onChange(async v => {
					this.plugin.settings.pageMargin = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Paper size')
			.addDropdown(d => d
				.addOption('letter', 'US Letter')
				.addOption('a4', 'A4')
				.setValue(this.plugin.settings.paperSize)
				.onChange(async v => {
					this.plugin.settings.paperSize = v as MD2ResumeSettings['paperSize'];
					await this.plugin.saveSettings();
				}));
	}
}
