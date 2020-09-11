import puppeteer from 'puppeteer-core';
import {exec} from 'child_process'
import util from 'util';

const execPromise = util.promisify(exec);
let browser = null,
    page = null;

const getExecPath = async()=>{
    try{
        const {stdout} = await execPromise("which chromium-browser");
        if(stdout)
            return stdout.trim();
        else 
            return '';
    }
    catch(err){
        console.log(err)
    }
}
export const startPuppeteer = async(filePath) =>{ //launch chromium-browser
    try{
        if(!browser){
            let chromiumPath = await getExecPath();
            browser = await puppeteer.launch({
                headless:false,
                executablePath:chromiumPath,
                defaultViewport:null,
                args:['--kiosk'],
                ignoreDefaultArgs:true
            })    
        }
        page = await browser.pages();
        await page[0].goto(`file://${filePath}`,{waitUntil:'load',timeout:0})
    }
    catch(err){
        console.log(err)
    }
    
}

export const stopPuppeteer = async() =>{  //stop chromium-browser
    try{
        if(browser)
        await browser.close();
    page = null;
    browser = null;
    }
   catch(err){
       console.log(err)
   }
}