# photo-frame

A puppeteer and node js project to play images and videos on chromium browser. Supports images of JPG, GIF, PNG formats and videos of mp4, mov, flv, mkv formats. Designed to work on Linux platforms.  

## Installation
Install chromium-browser

```bash
sudo apt-get install chromium-browser
```
Change Directory to photo-frame-master
and run
```bash
npm install
```
install ffmpeg

```bash
sudo apt install ffmpeg
```

## Usage
1. Copy Images or Videos to assets directory
2. Change DURATION in main.js file to change the duration of displaying each asset.
    Default to 10 seconds.
3. Give the screen resolution. Default resolution is 1366X786.
4. Set FIT_TO_SCREEN to show the image in fullscreen. Default to true
5. Build the application:
   ```bash
   npm run build
   ```
6. Run the application:
   ```bash
   npm start
   ```

## Development
The project uses webpack to bundle the JavaScript files. The assets and playlist folders are excluded from the bundle as they are configured to download files later.

To make changes to the code:
1. Modify the source files as needed
2. Rebuild the application:
   ```bash
   npm run build
   ```
3. Start the application with:
   ```bash
   npm start
   ```
