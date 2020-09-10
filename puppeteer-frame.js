import puppeteer from 'puppeteer-core';
let browser = null,
    page = null;


export const startPuppeteer = async(filePath) =>{ //launch chromium-browser
    try{
        if(!browser){
            browser = await puppeteer.launch({
                headless:false,
                executablePath:'/usr/bin/chromium-browser',
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