import path, { resolve } from 'path';
import {promises as fs} from 'fs'
import {startPuppeteer,stopPuppeteer} from './puppeteer-frame.js';
const rootPath = process.cwd();
const assetDir = path.join(rootPath,"assets/");
const sleep = async(ms)=>{   //promisify setTimeout
    return new Promise(resolve=>{
        setTimeout(resolve,ms);
    })
}
(async()=>{
    const data= await fs.readFile(assetDir+"config.json","utf8");
    const fileData = JSON.parse(data);
    const assets = fileData.assets;

    for(const asset of assets){
        await startPuppeteer(assetDir+asset.name);
        await sleep(asset.duration*1000);
    }
   await stopPuppeteer();
})()