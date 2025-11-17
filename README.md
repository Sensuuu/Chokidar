# Chokidar - Downloads Organizer

Automatically organize your Downloads folder into categories. Files get sorted by type (Videos, Music, Documents, etc.) in real-time.

## Features

- Watches Downloads folder automatically
- Moves files to correct folders by type
- Creates organized subfolders (Documents/PDFs, Music/MP3s, etc.)
- Renames duplicates automatically
- Logs all activity with timestamps
- Runs silently in background
- Starts automatically on PC boot

## Setup

### 1. Install Node.js

Download from https://nodejs.org (get the LTS version)

### 2. Install Dependencies

```
npm install
```

### 3. Create .env File

Create a file called `.env` in your project folder and add:

DOWNLOADS_DIR=C:\Users\YOUR_USERNAME\Downloads
DRY_RUN=false

Replace `YOUR_USERNAME` with your actual Windows username and also you can use any specific directory if you want.

**Important:** This file is NOT on GitHub - you must create it yourself!

### 4. Run the Script

To test it first:

```
node index.js
```

To run silently in background:

```
start-watcher.bat
```

## Auto-Start on Boot (Windows)

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Right-click → New → Shortcut
4. Paste the path to `start-watcher.bat`
5. Name it "Chokidar" or whatever you want.
6. Click Finish

Now it runs automatically when you boot your PC!

## How It Works

Downloads folder gets organized like this:

```
Videos/ - .mp4, .mkv, .avi, .mov files
Music/
MP3s/ - .mp3 files
WAV/ - .wav files
Others/ - .flac, .aac, .ogg, .m4a files
Images/ - .jpg, .png, .gif, .bmp files
Documents/
PDFs/ - .pdf files
Word/ - .doc, .docx files
Excel/ - .xls, .xlsx files
Others/ - .txt, .ppt files
Archives/ - .zip, .rar, .7z files
IMP FILES/ - Unknown file types
```

Want to change the rules? Edit `rules.json`

## Check If It's Working

### View Logs

Open this file: `logs/organizer.log`

You'll see entries like:

```
[2025-11-17 15:30:42] INFO: Moved: song.mp3 -> Music/MP3s/song.mp3
[2025-11-17 15:30:45] INFO: Moved: video.mp4 -> Videos/video.mp4
```

### See If Process Is Running

Press `Ctrl + Shift + Esc` (Task Manager) and look for `node.exe` in the Processes list.

### Quick Test

1. Download any file
2. Wait 2-3 seconds
3. Check if it moved to the right folder

## What Files Do What

- `index.js` - Main script that watches and organizes
- `rules.json` - Rules for which file types go where
- `.env` - Your configuration (YOU create this!)
- `logs/organizer.log` - Log file (created automatically)
- `launch-organizer.vbs` - Makes it run silently
- `start-watcher.bat` - Launcher for silent mode

## Stop It Anytime

Press `Ctrl + C` in the terminal, or:

1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Find `node.exe`
3. Right-click → End Task

## Troubleshooting

**Files not moving?**

- Check your `.env` file has the correct path
- Check the file type is in `rules.json`
- Look at `logs/organizer.log` for errors

**Script won't start?**

- Make sure `.env` file exists
- Make sure Node.js is installed (`node --version`)
- Check `logs/organizer.log` for error messages

**Logs folder not created?**

- Run the script once and it creates the folder automatically

## Author

Anurag Giri
