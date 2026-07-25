import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import { MD2ResumeSettings } from './types';
import type MD2ResumePlugin from './main';

export class MD2ResumeSettingTab extends PluginSettingTab {
	plugin: MD2ResumePlugin;

	constructor(app: App, plugin: MD2ResumePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof MD2ResumeSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		(this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
		await this.plugin.saveSettings();
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Font family',
				desc: 'CSS font-family for the resume.',
				control: { type: 'text' as const, key: 'fontFamily' },
			},
			{
				name: 'Font size',
				desc: 'CSS font size (e.g. 10pt, 11px).',
				control: { type: 'text' as const, key: 'fontSize' },
			},
			{
				name: 'Page margin',
				desc: 'Print margin (e.g. 0.6in, 15mm).',
				control: { type: 'text' as const, key: 'pageMargin' },
			},
			{
				name: 'Paper size',
				control: {
					type: 'dropdown' as const,
					key: 'paperSize',
					options: { letter: 'US Letter', a4: 'A4' },
				},
			},
		];
	}

	// Fallback for Obsidian < 1.13.0
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl).setName('Appearance').setHeading();

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
