import path from 'path';
import Jimp from 'jimp';
import jo from 'jpeg-autorotate';
import {promises as fs} from 'fs'
import {startPuppeteer,stopPuppeteer} from './puppeteer-frame.js';

const rootPath = process.cwd();
const assetDir = path.join(rootPath,"assets/");
const playlistDir = path.join(rootPath,"playlist/")
const imgRegex =/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
const vidRegex = /(mp4|mov|m4v|avi|webm|wmv|flv|mkv|mpg|mpeg|3gp)$/i;

//// Change this to change the duration of displaying each asset
const DURATION = 20,    //in seconds

//Change this to your Screen resolution     
     HEIGHT = 786,   // in pixels
     WIDTH = 1366,
     FIT_TO_SCREEN = true;
////
const sleep = async(ms)=>{   //promisify setTimeout
    return new Promise(resolve=>{
        setTimeout(resolve,ms);
    })
}

const updateConfig = async() =>{
    let assets =[];
    let writeObj = {};
    try{
        let data = await fs.readdir(assetDir);
        data = data.filter(file =>(file.match(imgRegex) || file.match(vidRegex)));
        data.forEach(file=>{
            let obj={};
            obj.name=file;
            if(file.match(imgRegex)) 
                obj.type="image";
            else
                obj.type="video";

            obj.duration = DURATION;
            assets.push(obj);
        })
        writeObj.assets = assets;
        await fs.writeFile(playlistDir+"config.json",JSON.stringify(writeObj),"utf-8");
    }
    catch(err){
        console.log(err)
    }
}

const autorotate = async(img) =>{
    try{
        const fileIn = await fs.readFile(assetDir+img)
        const {buffer} = await jo.rotate(fileIn, {quality: 85})
        return buffer;
    }
    catch(err){
        if (err.code === jo.errors.correct_orientation) {
            console.log('The orientation of this image is already correct!');
            return null;
          }
    }
}

const processImg = async(img) =>{
    try{
        const buffer =  await autorotate(img)|| assetDir+img;
        const image = await Jimp.read(buffer)
        if(image && FIT_TO_SCREEN){
            image.resize(WIDTH,HEIGHT);
        }
        image.write(playlistDir+img)
    }
    catch(err){
        console.log(err)
    }
}


(async()=>{
    await updateConfig();
    const data= await fs.readFile(playlistDir+"config.json","utf8");
    const fileData = JSON.parse(data);
    const assets = fileData.assets;

    for(const asset of assets){
        asset.type === "image" ? await processImg(asset.name) : null;
        await startPuppeteer(playlistDir+asset.name);
        await sleep(asset.duration*1000);
    }
   await stopPuppeteer();
})()