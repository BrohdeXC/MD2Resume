import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, MD2ResumeSettings } from './types';
import { MD2ResumeSettingTab } from './settings';
import { ResumePreviewView, VIEW_TYPE_RESUME } from './previewView';

export default class MD2ResumePlugin extends Plugin {
	settings!: MD2ResumeSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Detach any leaves left open from a previous plugin instance before
		// re-registering the view type, so the registry stays consistent on reload.
		this.app.workspace.getLeavesOfType(VIEW_TYPE_RESUME).forEach(l => l.detach());

		this.registerView(VIEW_TYPE_RESUME, (leaf) => new ResumePreviewView(leaf, this));

		this.addRibbonIcon('file-text', 'Preview resume', () => {
			void this.activateView();
		});

		this.addCommand({
			id: 'preview-resume',
			name: 'Preview resume',
			callback: () => { void this.activateView(); },
		});

		this.addSettingTab(new MD2ResumeSettingTab(this.app, this));
	}

	onunload(): void {}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		// Reuse existing leaf if open
		const existing = workspace.getLeavesOfType(VIEW_TYPE_RESUME);
		if (existing.length > 0 && existing[0]) {
			await workspace.revealLeaf(existing[0]);
			return;
		}

		// Open in right split
		let leaf: WorkspaceLeaf | null = workspace.getRightLeaf(false);
		if (!leaf) leaf = workspace.getLeaf(true);
		await leaf.setViewState({ type: VIEW_TYPE_RESUME, active: true });
		await workspace.revealLeaf(leaf);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<MD2ResumeSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
