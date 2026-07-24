import { ContactInfo, EntryType, ResumeData, ResumeEntry, ResumeSection } from './types';

function slugify(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseFrontmatter(md: string): { contact: ContactInfo; body: string } {
	const fmMatch = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	const contact: ContactInfo = { name: '', contact: '' };

	if (fmMatch) {
		const fmLines = (fmMatch[1] ?? '').split('\n');
		for (const line of fmLines) {
			const colonIdx = line.indexOf(':');
			if (colonIdx === -1) continue;
			const key = line.slice(0, colonIdx).trim();
			const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
			contact[key] = val;
		}
		return { contact, body: fmMatch[2] ?? '' };
	}

	return { contact, body: md };
}

function parseEntry(headerLine: string, lines: string[]): ResumeEntry {
	const cleanHeader = headerLine.replace(/^###\s*/, '').trim();

	let type: EntryType = 'project';
	let title = cleanHeader;
	let date: string | undefined;

	if (cleanHeader.includes('|')) {
		type = 'job';
		const pipeIdx = cleanHeader.lastIndexOf('|');
		title = cleanHeader.slice(0, pipeIdx).trim();
		date = cleanHeader.slice(pipeIdx + 1).trim();
	} else if (cleanHeader.includes(':')) {
		type = 'project';
		// title stays as full string; split on first colon for display
	}

	const entry: ResumeEntry = { type, title, date, bullets: [], tags: [] };

	let i = 0;
	// First non-blank line may be *Company, Location*
	while (i < lines.length && lines[i]?.trim() === '') i++;
	if (i < lines.length) {
		const firstContent = lines[i]?.trim() ?? '';
		if (firstContent.startsWith('*') && firstContent.endsWith('*') && !firstContent.startsWith('**')) {
			entry.subtitle = firstContent.replace(/^\*|\*$/g, '');
			i++;
		}
	}

	for (; i < lines.length; i++) {
		const line = lines[i]?.trim() ?? '';
		if (line.startsWith('- ') || line.startsWith('* ')) {
			entry.bullets.push(line.slice(2).trim());
		}
	}

	return entry;
}

function parseSection(block: string): ResumeSection {
	const lines = block.split('\n');
	const heading = (lines[0] ?? '').replace(/^##\s*/, '').trim();
	const id = slugify(heading);
	const section: ResumeSection = { id, heading, entries: [], tags: [] };

	let i = 1;
	while (i < lines.length) {
		const line = lines[i] ?? '';

		if (line.match(/^###\s/)) {
			// Collect lines until next ### or end
			const entryLines: string[] = [];
			i++;
			while (i < lines.length && !(lines[i] ?? '').match(/^###\s/)) {
				entryLines.push(lines[i] ?? '');
				i++;
			}
			section.entries.push(parseEntry(line, entryLines));
		} else if (line.startsWith('- ') || line.startsWith('* ')) {
			// Bullet without an entry header → bare bullet in section
			const bare: ResumeEntry = { type: 'tag-list', title: '', bullets: [line.slice(2).trim()], tags: [] };
			section.entries.push(bare);
			i++;
		} else {
			const trimmed = line.trim();
			// Plain text lines → tag list (Certifications style)
			if (trimmed && !trimmed.startsWith('#')) {
				section.tags.push(trimmed);
			}
			i++;
		}
	}

	return section;
}

export function parseResume(md: string): ResumeData {
	const { contact, body } = parseFrontmatter(md);

	// Split on lines that start with ## (but not ###)
	const sectionBlocks = body.split(/(?=^## )/m).filter(b => b.trim());

	const sections: ResumeSection[] = [];
	for (const block of sectionBlocks) {
		if (block.match(/^## /)) {
			sections.push(parseSection(block.trimStart()));
		}
	}

	return { contact, sections };
}
