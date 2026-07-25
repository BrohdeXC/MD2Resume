# MD2Resume
An Obsidian plugin to convert markdown into a nice-looking resume!

<img width="2143" height="1318" alt="image" src="https://github.com/user-attachments/assets/ecfcf35b-c053-443d-96d3-f999beabd822" />

## Overview
I've spent far too many hours just trying to make my resume look right. No matter if I'm in Google Docs or Word, the formatting is always off. You know what's consistent? Markdown. That's why I built MD2Resume.

## Installation
**Note: Currently this is not supported as a Commmunity Plugin, someday I hope to get it approved!**
1. Navigate to the plugins directory of your Obsidian vault
```bash
cd ~/VAULT/PATH/.obsidian/plugins/
```
2. Clone the project
```bash
git clone https://github.com/BrohdeXC/MD2Resume
```
3. Navigate to the community plugins tab in Obsidian and if you don't have community plugins enabled, do that now
<img width="1193" height="685" alt="image" src="https://github.com/user-attachments/assets/20cac661-e9b1-4ef1-9ca6-30f02b3c27de" />

4. Refresh the plugins and enable it
<img width="1198" height="676" alt="image" src="https://github.com/user-attachments/assets/d8077b10-0d14-4270-9ad4-6d4a9cca6146" />

## Quick Usage
1. Grab the MD2Resume-Template.md file and move it into your vault, rename it as desired
```
mv ~/VAULT/PATH/.obsidian/plugins/MD2Resume/MD2Resume-Template.md ~/VAULT/PATH/RESUMES/YourResume.md
```
2. While looking at your file, press the "Preview Resume" button on the left panel
<img width="266" height="342" alt="image" src="https://github.com/user-attachments/assets/76ed2014-83a8-443c-8ff1-09b9d74ac21b" />

3. Make that resume!  
4. Once you're ready to export, press the "Export as PDF" button above the preview  
<img width="2030" height="868" alt="image" src="https://github.com/user-attachments/assets/d6fcac9c-d097-4056-a1ba-c114937d1438" />

5. Select the destination for the file and give it a name, now you're ready to submit that application!
<img width="1750" height="1200" alt="image" src="https://github.com/user-attachments/assets/78a26efd-ce61-4f9b-bc3c-9616bb20413b" />

## Detailed Usage
### Properties
The properties are values that show up at the top of the resume. This includes name, contact information, and a quick bio. These automatically generate hyperlinks in the PDF.
Currently supported properties include:
* `name` - Your Name
* `contact_email` - Your Email
* `contact_phone` - Your Phone Number
* `contact_website` - Your Website
* `contact_linkedin` - Your LinkedIn
* `contact_github` - Your GitHub
* `header` - Your bio

### Body
**Sections:** `## Section Name`  
Any name; freely defined.  

**Job entries:** `### Title | Date Range`  
The `|` separator triggers job formatting with a dot-leader between title and date. An optional italicized subtitle on the next line (`*Company, Location*`) is supported.

**Project entries:** `### Title: Subtitle`  
The `:` separator splits the title for inline subtitle styling. Without a `:` or `|`, it renders as a plain titled entry.

**Bullets:** `-` or `*` bullets  
Works at section level (bare bullets) and inside entries.

**Tag/plain-text lines:** Any non-heading  
Non-bullet plain text in a section body becomes a tag-list item (useful for certifications, tools, etc.).

### Comments
Single hashes `#` and 4x hashes `####` don't generate text in the PDF. This is so they can be used as comments and logic separators that you might not want to show in the resume itself.
