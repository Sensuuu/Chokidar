// Load environment variables from .env
require("dotenv").config();

//Import file systems module to read files
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const winston = require("winston");

//Create logs folder if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

//Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "organizer.log"),
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),
  ],
});

//Load rules from rules.json
const rulesPath = path.join(__dirname, "rules.json");
const rulesData = fs.readFileSync(rulesPath, "utf8");
const rules = JSON.parse(rulesData);

//Print Config
console.log("Downloads Directory:", process.env.DOWNLOADS_DIR);
console.log("Dry run mode:", process.env.DRY_RUN);
console.log("\nRules loaded:");
rules.rules.forEach((rule, index) => {
  console.log(
    `${index + 1}. ${rule.name} -> ${rule.folder} (${
      rule.extensions.length
    } extensions)`
  );
});
console.log(`\nDefault folder for unknown types: ${rules.defaultFolder}`);

//Function to find which folder a file should go to
function getTargetFolder(filePath) {
  //Get file extension (e.g., ".png" from "image.png")
  const ext = path.extname(filePath).toLowerCase();

  //Look through all rules to find a match
  for (const rule of rules.rules) {
    if (rule.extensions.includes(ext)) {
      return rule.folder; //Found a match!
    }
  }
  //No match found, use default folder
  return rules.defaultFolder;
}

// Function to safely move a file
function moveFile(filePath, targetFolder) {
  const fileName = path.basename(filePath);
  const downloadsDir = process.env.DOWNLOADS_DIR;
  const destinationDir = path.join(downloadsDir, targetFolder);
  let destinationPath = path.join(destinationDir, fileName);

  //Check if we're in dry-run mode
  if (process.env.DRY_RUN === "true") {
    console.log(`  [DRY RUN] Would move to: ${destinationPath}`);
    return; // Exit early without actually moving
  }

  //Make sure destination folder exists
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
    console.log(`  ✅ Created Folder: ${targetFolder}`);
  }

  //Handle Filename collision
  if (fs.existsSync(destinationPath)) {
    const ext = path.extname(fileName);
    const nameWithoutExt = path.basename(fileName, ext);
    let counter = 2;

    // Keep trying numbers until we find one that doesn't exist
    while (fs.existsSync(destinationPath)) {
      const newFileName = `${nameWithoutExt} (${counter})${ext}`;
      destinationPath = path.join(destinationDir, newFileName);
      counter++;
    }
    console.log(
      `  ⚠️ File exists, renaming to: ${path.basename(destinationPath)}`
    );
  }

  //Move the file and log file.
  try {
    fs.renameSync(filePath, destinationPath);
    logger.info(
      `Moved: ${fileName} -> ${targetFolder}/${path.basename(destinationPath)}`
    );
    console.log(
      `  ✅ Moved to: ${targetFolder}/${path.basename(destinationPath)}`
    );
  } catch (error) {
    logger.error(`Failed ot move ${fileName}: ${error.message}`);
    console.error(` ❌ Error moving file: ${error.message}`);
  }
}

//Configure the watcher
const watcher = chokidar.watch(process.env.DOWNLOADS_DIR, {
  ignored: /(^|[\/\\])\../, // Ignore hidden files like .DS_Store
  persistent: true, // Keep the script running
  ignoreInitial: true, // Don't trigger for files already there
  depth: 0,
  awaitWriteFinish: {
    stabilityThreshold: 2000, // Wait 2 seconds of no changes
    pollInterval: 100, // Check every 100ms
  },
});

//Log when watcher starts
console.log(`\n👀 Watching for new files in: ${process.env.DOWNLOADS_DIR}`);
console.log("Press Ctrl+C to stop.\n");

//Detect when a new file is added
watcher.on("add", (filePath) => {
  const fileName = path.basename(filePath);
  const targetFolder = getTargetFolder(filePath);

  console.log(`📥 New file detected: ${fileName}`);
  console.log(`  -> Should go to: ${targetFolder}`);

  moveFile(filePath, targetFolder);
});

//Detect errors
watcher.on("error", (error) => {
  console.error(`Watcher error: ${error}`);
});
