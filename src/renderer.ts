import { ContactInfo, MD2ResumeSettings, ResumeData, ResumeEntry, ResumeSection } from './types';

function escHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildContactLine(contact: ContactInfo): string {
	const parts: string[] = [];

	if (contact['contact_phone']) {
		const p = contact['contact_phone'];
		const tel = p.replace(/[^+\d]/g, '');
		parts.push(`<a href="tel:${tel}" class="contact-link">${escHtml(p)}</a>`);
	}

	if (contact['contact_email']) {
		const e = contact['contact_email'];
		parts.push(`<a href="mailto:${escHtml(e)}" class="contact-link">${escHtml(e)}</a>`);
	}

	if (contact['contact_website']) {
		const v = contact['contact_website'];
		const href = v.startsWith('http') ? v : `https://${v}`;
		const display = v.replace(/^https?:\/\//, '');
		parts.push(`<a href="${escHtml(href)}" class="contact-link">${escHtml(display)}</a>`);
	}

	if (contact['contact_linkedin']) {
		const v = contact['contact_linkedin'];
		let href: string;
		let display: string;
		if (v.startsWith('http')) {
			href = v;
			display = v.replace(/^https?:\/\//, '');
		} else if (v.includes('/')) {
			href = `https://${v}`;
			display = v;
		} else {
			href = `https://linkedin.com/in/${v}`;
			display = `linkedin.com/in/${v}`;
		}
		parts.push(`<a href="${escHtml(href)}" class="contact-link">${escHtml(display)}</a>`);
	}

	if (contact['contact_github']) {
		const v = contact['contact_github'];
		let href: string;
		let display: string;
		if (v.startsWith('http')) {
			href = v;
			display = v.replace(/^https?:\/\//, '');
		} else if (v.includes('/')) {
			href = `https://${v}`;
			display = v;
		} else {
			href = `https://github.com/${v}`;
			display = `github.com/${v}`;
		}
		parts.push(`<a href="${escHtml(href)}" class="contact-link">${escHtml(display)}</a>`);
	}

	// Fallback: old single `contact` field
	if (parts.length === 0 && contact['contact']) {
		return escHtml(contact['contact']);
	}

	return parts.join(' | ');
}

function renderEntry(entry: ResumeEntry): string {
	const parts: string[] = [];

	if (entry.title) {
		if (entry.type === 'job' && entry.date) {
			parts.push(`<div class="entry-header">
				<span class="entry-title">${escHtml(entry.title)}</span>
				<span class="dot-leader"></span>
				<span class="entry-date">${escHtml(entry.date)}</span>
			</div>`);
		} else if (entry.type === 'project') {
			const colonIdx = entry.title.indexOf(':');
			if (colonIdx !== -1) {
				const projectTitle = escHtml(entry.title.slice(0, colonIdx));
				const projectSub = escHtml(entry.title.slice(colonIdx));
				parts.push(`<div class="entry-header">
				<span class="entry-title">${projectTitle}</span><span class="entry-subtitle-inline">${projectSub}</span>
			</div>`);
			} else {
				parts.push(`<div class="entry-header">
				<span class="entry-title">${escHtml(entry.title)}</span>
			</div>`);
			}
		}
	}

	if (entry.subtitle) {
		parts.push(`<p class="entry-subtitle"><em>${escHtml(entry.subtitle)}</em></p>`);
	}

	if (entry.bullets.length > 0) {
		const lis = entry.bullets.map(b => `<li>${escHtml(b)}</li>`).join('\n');
		parts.push(`<ul class="entry-bullets">\n${lis}\n</ul>`);
	}

	return `<div class="entry">${parts.join('\n')}</div>`;
}

function renderSection(section: ResumeSection): string {
	const parts: string[] = [];

	for (const entry of section.entries) {
		if (entry.type !== 'tag-list') {
			parts.push(renderEntry(entry));
		}
	}

	if (section.tags.length > 0) {
		const items = section.tags.map(t => `<span>${escHtml(t)}</span>`).join('\n');
		parts.push(`<div class="tag-list">\n${items}\n</div>`);
	}

	return `<section class="resume-section" data-id="${escHtml(section.id)}">
		<h2 class="section-heading">${escHtml(section.heading)}</h2>
		<hr class="section-rule">
		${parts.join('\n')}
	</section>`;
}

export function renderResume(data: ResumeData, settings: MD2ResumeSettings): string {
	const cssVars = [
		`--resume-font-size: ${settings.fontSize}`,
		`--resume-font-family: ${settings.fontFamily}`,
		`--resume-margin: ${settings.pageMargin}`,
		`--resume-paper-size: ${settings.paperSize}`,
	].join('; ');

	const headerLabel = data.contact['header'] ?? '';
	const headerLabelHtml = headerLabel
		? `<p class="resume-header-label">${escHtml(headerLabel)}</p>`
		: '';

	const contactLine = buildContactLine(data.contact);

	const header = `<div class="resume-header">
		<h1 class="resume-name">${escHtml(data.contact['name'] ?? '')}</h1>
		<p class="resume-contact">${contactLine}</p>
		${headerLabelHtml}
	</div>`;

	const sections = data.sections.map(renderSection).join('\n');

	return `<div class="resume-root" style="${cssVars}">${header}\n${sections}\n</div>`;
}
