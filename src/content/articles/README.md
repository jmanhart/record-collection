# Record Articles

This directory contains Markdown articles for album reviews and notes.

## Directory Structure

```
articles/
├── <record_id>.md         # Article files named by Discogs ID
├── README.md             # This documentation
└── by-name/             # Human-readable symlinks
    └── Artist - Album.md  # Symlinks to record_id.md files
```

## Adding a New Article

1. **Get the Record ID**

   - Find the Discogs ID from your collection
   - This is visible in the URL when viewing a record: `discogs.com/release/<record_id>`
   - Or check the record details in the app

2. **Create the Article File**
   Create a new file named `<record_id>.md` with this template:

   ```markdown
   # Album Title - Artist Name

   ## Overview

   Brief introduction about the album and this specific pressing.

   ## Sound Quality

   - Pressing Quality: [Details about pressing plant, quality]
   - Surface Noise: [Note any surface noise or issues]
   - Dynamic Range: [Comment on the dynamic range and overall sound]
   - Stereo Imaging: [Describe the stereo field and instrument placement]

   ## Highlights

   - A1: "Track Name" - Brief note about the track
   - B2: "Track Name" - Brief note about the track
     [Add notable tracks and comments]

   ## Technical Details

   - Format: [Vinyl/CD/etc., additional format details]
   - Release Year: [Year]
   - Pressing: [Country/Plant if known]
   - Labels: [Record labels]
   - Catalog Number: [Number]
   - Notes: [Any additional pressing/release info]

   ## Rating

   [Your rating out of 5 stars, with explanation]

   ## Additional Notes

   [Any additional thoughts, comparisons to other pressings, historical context, etc.]

   ---

   Last Updated: [Date]
   ```

3. **Create a Human-Readable Symlink**
   Run this command from the project root:

   ```bash
   # macOS/Linux:
   cd src/content/articles && ln -s ../<record_id>.md "by-name/Artist - Album Title.md"

   # Windows (requires admin privileges):
   cd src/content/articles && mklink "by-name\Artist - Album Title.md" "..\<record_id>.md"
   ```

4. **Copy to Public Directory**
   Run the copy script to make the article available:
   ```bash
   node scripts/copyArticles.js
   ```

## Writing Guidelines

- Be specific about the pressing/version being reviewed
- Include objective observations about sound quality
- Note any special features or defects
- Compare to other pressings if possible
- Update the "Last Updated" date when making changes

## Markdown Tips

- Use `#` for main title
- Use `##` for sections
- Use `-` for bullet points
- Use `*italic*` or `**bold**` for emphasis
- Use `[text](link)` for links
- Use ``` for code blocks
