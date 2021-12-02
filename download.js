const puppeteer = require('puppeteer')
const https = require('https')
    
const providers = {
    'snaptik': async ({
        page,
    }, url) => {
        await page.goto('https://snaptik.app/en')
        await page.waitForSelector('#url')
        await page.type('#url', url)
        await page.click('#submiturl')
        await page.waitForSelector('a.is-success')
        const link = await page.$eval('a.is-success', element => element.getAttribute('href'))

        return new Promise((resolve, reject) => {
            const request = https.get(link, function(response) {
                resolve(response)
            })

            request.on('error', reject)
        })
    }
}

module.exports.download = async (url) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const context = {
        browser,
        page,
    }
    
    try {
        return await providers['snaptik'](context, url)
    }
    finally {
        await page.close()
        await browser.close()
    }
}
