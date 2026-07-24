export interface ContactInfo {
	name: string;
	contact: string;
	[key: string]: string;
}

export type EntryType = 'job' | 'project' | 'tag-list';

export interface ResumeEntry {
	type: EntryType;
	title: string;
	date?: string;
	subtitle?: string;
	bullets: string[];
	tags: string[];
}

export interface ResumeSection {
	id: string;
	heading: string;
	entries: ResumeEntry[];
	tags: string[];
}

export interface ResumeData {
	contact: ContactInfo;
	sections: ResumeSection[];
}

export interface MD2ResumeSettings {
	fontSize: string;
	fontFamily: string;
	pageMargin: string;
	paperSize: 'letter' | 'a4';
}

export const DEFAULT_SETTINGS: MD2ResumeSettings = {
	fontSize: '10pt',
	fontFamily: "'Times New Roman', Times, serif",
	pageMargin: '0.6in',
	paperSize: 'letter',
};
