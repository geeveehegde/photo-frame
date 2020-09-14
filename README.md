# photo-frame

photo and video player using Nodejs and puppeteer.

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
2. Change DURAION in main.js file to change the duration of displaying each asset.
    Default to 10 seconds.
3. Give the screen resolution. Default resolution is 1366X786.
4. Set FIT_TO_SCREEN to show the image in fullscreen. Default to false
3. Run main.js file
