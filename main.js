import path from 'path';
import Jimp from 'jimp';
import jo from 'jpeg-autorotate';
import {promises as fs} from 'fs'
import {startPuppeteer,stopPuppeteer} from './puppeteer-frame.js';
import ffmpeg from 'fluent-ffmpeg';

const rootPath = process.cwd();
const assetDir = path.join(rootPath,"assets/");
const playlistDir = path.join(rootPath,"playlist/")
const imgRegex =/\.(gif|jpe?g|png|bmp)$/i
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
const processAssets = async() =>{
    try{
        let playlistFiles = await fs.readdir(playlistDir);
        playlistFiles = playlistFiles.filter(file =>(file.match(imgRegex) || file.match(vidRegex)));
        for(const file of playlistFiles){
            await fs.unlink(playlistDir+file)
        }
        let assets = await fs.readdir(assetDir);
        assets = assets.filter(file =>(file.match(imgRegex) || file.match(vidRegex)));
        for(const file of assets){
            var re = /(?:\.([^.]+))?$/;
            const ext = re.exec(file);
            var filename = file.replace(/\.[^/.]+$/, "");
            if(file.match(imgRegex))
                await processImg(file)
            else if(file.match(vidRegex)){
               await processVid(filename,ext[0])
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

const updateConfig = async() =>{
    let assets =[];
    let writeObj = {};
    try{
        let data = await fs.readdir(playlistDir);
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

const  promisifyCommand = async(command, run='run') => {
    return new Promise( (...args) => {
        const cb = args.pop()        
        command
        .on( 'end',   ()      => { cb(`processed file`) } )
        .on( 'error', (error) => { cb(error) } )[run](...args)
    })
}
const processVid = async(fileName,ext) =>{
    try{
        const command = ffmpeg().input(assetDir+fileName+ext).output(playlistDir+`${fileName}.mp4`)
                        .videoCodec('libx264').size(`${WIDTH}x${HEIGHT}`)
       const data = await promisifyCommand(command)
       
    }
    catch(err){
        console.log(err)
    }
}

(async()=>{
    await processAssets()
    await updateConfig();
    const data= await fs.readFile(playlistDir+"config.json","utf8");
    const fileData = JSON.parse(data);
    const assets = fileData.assets;

    for(const asset of assets){
        await startPuppeteer(playlistDir+asset.name);
        await sleep(asset.duration*1000);
    }
   await stopPuppeteer();
})()