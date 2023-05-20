const playwright = require('playwright');
const fs = require('fs');

async function main() {
    const browser =  await playwright.chromium.launch({ headless: true});

    const page = await browser.newPage()

    await page.goto('https://www.global-freaks.com/es/105-wcf');

    const figuritas = await page.$$eval('.product-description', (rows) => (
        rows.map((row) => {

            const title = row.querySelector('h2 a').innerText.trim();

            return { title };
        })
    ));
    
    const fileFiguritas = fs.readFileSync("figuritas.txt").toString();
    if(fileFiguritas){
        if(fileFiguritas !== figuritas[0].title){
            fs.writeFileSync('figuritas.txt', figuritas[0].title.toString());
        }
    }else{
        fs.writeFileSync('figuritas.txt', figuritas[0].title.toString());
    }

    await browser.close();
}

main();