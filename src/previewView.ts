import { Editor, ItemView, MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';
import { parseResume } from './parser';
import { renderResume } from './renderer';
import type MD2ResumePlugin from './main';

export const VIEW_TYPE_RESUME = 'md2resume-preview';

const PAGE_SIZES: Record<string, { w: number; h: number }> = {
	letter: { w: 8.5,   h: 11 },
	a4:     { w: 8.267, h: 11.693 },
};
const DPI = 96;

export class ResumePreviewView extends ItemView {
	plugin: MD2ResumePlugin;
	private lastFile: TFile | null = null;
	private renderTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: MD2ResumePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string { return VIEW_TYPE_RESUME; }
	getDisplayText(): string { return 'Resume Preview'; }
	getIcon(): string { return 'file-text'; }

	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('md2resume-view');

		const toolbar = contentEl.createDiv('md2resume-toolbar');
		const printBtn = toolbar.createEl('button', { text: 'Print / Save as PDF', cls: 'md2resume-print-btn' });
		printBtn.addEventListener('click', () => { void this.openPrintWindow(); });

		contentEl.createDiv('md2resume-frame');

		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor) => {
				this.scheduleRender(editor.getValue());
			})
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => { void this.render(); })
		);

		await this.render();
	}

	private scheduleRender(md: string): void {
		if (this.renderTimer) clearTimeout(this.renderTimer);
		this.renderTimer = setTimeout(() => { void this.renderFromString(md); }, 150);
	}

	async renderFromString(md: string): Promise<void> {
		const frame = this.contentEl.querySelector('.md2resume-frame') as HTMLElement | null;
		if (!frame) return;

		const data = parseResume(md);
		const html = renderResume(data, this.plugin.settings);
		await this.buildPagedPreview(frame, html);
	}

	async render(): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			this.lastFile = activeView.file;
			await this.renderFromString(activeView.editor.getValue());
			return;
		}
		const file = this.app.workspace.getActiveFile();
		if (!file || file.extension !== 'md') return;
		this.lastFile = file;
		const md = await this.app.vault.read(file);
		await this.renderFromString(md);
	}

	// ── Pagination ──────────────────────────────────────────

	private parseMarginToPx(margin: string): number {
		const val = parseFloat(margin);
		if (isNaN(val)) return Math.round(0.6 * DPI);
		if (margin.endsWith('in')) return Math.round(val * DPI);
		if (margin.endsWith('mm')) return Math.round(val * DPI / 25.4);
		if (margin.endsWith('cm')) return Math.round(val * DPI / 2.54);
		if (margin.endsWith('pt')) return Math.round(val * DPI / 72);
		return Math.round(val);
	}

	private async buildPagedPreview(frame: HTMLElement, html: string): Promise<void> {
		const { paperSize, pageMargin, fontSize, fontFamily } = this.plugin.settings;
		const size = PAGE_SIZES[paperSize] ?? PAGE_SIZES['letter']!;
		const pageW = Math.round(size.w * DPI);
		const pageH = Math.round(size.h * DPI);
		const marginPx = this.parseMarginToPx(pageMargin);
		const contentW = pageW - 2 * marginPx;
		const contentH = pageH - 2 * marginPx;

		// Render into an off-screen staging element so we can measure heights
		const staging = document.createElement('div');
		staging.style.cssText = [
			'position:absolute',
			'top:-99999px',
			'left:0',
			`width:${contentW}px`,
			'visibility:hidden',
			`font-family:${fontFamily}`,
			`font-size:${fontSize}`,
			'line-height:1',
		].join(';');
		staging.innerHTML = html;
		document.body.appendChild(staging);

		// Wait one microtask so the browser applies CSS and computes layout
		await new Promise<void>(resolve => setTimeout(resolve, 0));

		const resumeRoot = staging.querySelector('.resume-root') as HTMLElement | null;
		if (!resumeRoot) {
			document.body.removeChild(staging);
			return;
		}

		// Flatten all direct children of resume-root (header + sections)
		const blocks = Array.from(resumeRoot.children) as HTMLElement[];
		const heights = blocks.map(b => b.offsetHeight);

		document.body.removeChild(staging);

		// Greedily fill pages with blocks
		type Page = HTMLElement[];
		const pages: Page[] = [];
		let currentPage: Page = [];
		let usedH = 0;

		for (let i = 0; i < blocks.length; i++) {
			const bH = heights[i] ?? 0;
			const block = blocks[i];
			if (!block) continue;

			if (usedH + bH > contentH && currentPage.length > 0) {
				pages.push(currentPage);
				currentPage = [block];
				usedH = bH;
			} else {
				currentPage.push(block);
				usedH += bH;
			}
		}
		if (currentPage.length > 0) pages.push(currentPage);

		// Build the page cards in the frame
		frame.innerHTML = '';

		for (const pageBlocks of pages) {
			const pageEl = document.createElement('div');
			pageEl.className = 'resume-page resume-root';
			pageEl.style.cssText = [
				`width:${pageW}px`,
				`height:${pageH}px`,
				`padding:${marginPx}px`,
				`font-size:${fontSize}`,
				`font-family:${fontFamily}`,
				'line-height:1',
				// Re-apply CSS custom properties so child rules still resolve
				`--resume-font-size:${fontSize}`,
				`--resume-font-family:${fontFamily}`,
				`--resume-margin:${pageMargin}`,
				`--resume-paper-size:${paperSize}`,
			].join(';');

			for (const block of pageBlocks) {
				pageEl.appendChild(block.cloneNode(true));
			}
			frame.appendChild(pageEl);
		}
	}

	// ── Print / Export ──────────────────────────────────────

	private async openPrintWindow(): Promise<void> {
		// Re-render from source to get the full un-paginated HTML
		let md = '';
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			md = activeView.editor.getValue();
		} else {
			const file = this.app.workspace.getActiveFile();
			if (!file) return;
			md = await this.app.vault.read(file);
		}

		const data = parseResume(md);
		const resumeHtml = renderResume(data, this.plugin.settings);
		const css = this.collectResumeCss();
		const { pageMargin, paperSize } = this.plugin.settings;

		const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Resume</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: white; }
${css}
.resume-root {
  padding: ${pageMargin};
  max-width: none;
  box-shadow: none;
  margin: 0;
}
@media print {
  @page { size: ${paperSize}; margin: 0; }
}
</style>
</head>
<body>
${resumeHtml}
<script>
window.addEventListener('load', function() {
  setTimeout(function() { window.print(); }, 300);
});
</script>
</body>
</html>`;

		// Blob URLs fail in Electron (ERR_FILE_NOT_FOUND) because they are
		// origin-scoped to the renderer that created them and can't be opened
		// in a new BrowserWindow. Write to a temp file and open via shell.
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const fs    = require('fs')   as { writeFileSync: (p: string, d: string, enc: string) => void; unlinkSync: (p: string) => void };
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const path  = require('path') as { join: (...a: string[]) => string };
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const os    = require('os')   as { tmpdir: () => string };
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { shell } = require('electron') as { shell: { openPath: (p: string) => Promise<string> } };

			const tmpPath = path.join(os.tmpdir(), `md2resume-${Date.now()}.html`);
			fs.writeFileSync(tmpPath, doc, 'utf-8');
			await shell.openPath(tmpPath);

			// Clean up after the user has had time to print
			setTimeout(() => { try { fs.unlinkSync(tmpPath); } catch { /* ignore */ } }, 120_000);
		} catch (err) {
			console.error('MD2Resume: failed to open print window', err);
		}
	}

	private collectResumeCss(): string {
		const chunks: string[] = [];
		for (const sheet of Array.from(document.styleSheets)) {
			try {
				for (const rule of Array.from(sheet.cssRules)) {
					const text = rule.cssText;
					if (/resume-|\.entry|dot-leader|tag-list|section-rule|section-heading|contact-link/.test(text)) {
						chunks.push(text);
					}
				}
			} catch {
				// Cross-origin stylesheet — skip
			}
		}
		return chunks.join('\n');
	}

	async onClose(): Promise<void> {
		if (this.renderTimer) clearTimeout(this.renderTimer);
		this.contentEl.empty();
	}
}
