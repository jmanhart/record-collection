# Record Articles

This directory contains Markdown articles for album reviews and notes. Each article is named by its Discogs ID.

## Directory Structure

```
articles/
├── <record_id>.md    # Article files named by Discogs ID (e.g., 387851.md)
└── README.md         # This documentation
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
