const puppeteer = require('puppeteer');
const expect = require('expect-puppeteer');
const { setDefaultOptions } = require('expect-puppeteer');
setDefaultOptions({ timeout: 5000 });
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v1');


const user = 'your_username_here';
const password = 'your_password_here';
const keyboard = {'shift': '21', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '10', 'a': '22', 'b': '36', 'c': '34', 'd': '24', 'e': '13', 'f': '25', 'g': '26', 'h': '27', 'i': '18', 'j': '28', 'k': '29', 'l': '30', 'm': '38', 'n': '37', 'o': '19', 'p': '20', 'q': '11', 'r': '14', 's': '23', 't': '15', 'u': '17', 'v': '35', 'x': '33', 'z': '32', 'w': '12', 'y': '16', };

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function waitForFileToDownload(downloadPath) {
    console.log('Waiting to download file...');
    let filename;
    while (!filename || filename.endsWith('.crdownload')) {
        filename = fs.readdirSync(downloadPath)[0];
        await delay(500);
    }
    return filename;
}

async function download(page, selector) {
    const downloadPath = path.resolve(__dirname, 'download', uuid());
    mkdirp(downloadPath);
    console.log('Downloading file to:', downloadPath);
    await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadPath });
    await expect(page).toClick(selector);
    let filename = await waitForFileToDownload(downloadPath);
    return path.resolve(downloadPath, filename);
}


(async () => {
	
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});

	const page = await browser.newPage();

	await page.goto('https://internetbanking.caixa.gov.br', {waitUntil: 'networkidle2'});

	await expect(page).toClick('#tpPessoaJuridica');

	await page.type('#nomeUsuario', user, {delay: 20})
	
	await expect(page).toClick('#btnLogin');

	await expect(page).toClick('#lnkInitials');	

	await page.waitForSelector('#password', {
		visible: true,
	});

	await page.waitForSelector('#contentTeclado', {
		visible: true,
	});

	await delay(1000);

	for (let i = 0; i < password.length; i++) {
		await expect(page).toClick(`#teclado > ul > li:nth-child(${keyboard[password[i]]})`);
	}

	await page.evaluate(() => {
		document.querySelector('#btnConfirmar').click();
	});		

	await page.waitForSelector('#visibleSaldo', {
		visible: true,
	});

	await delay(3000);

	let balance = await page.evaluate(() => {
		return document.querySelector('#visibleSaldo').innerText;
	});	

	console.log("Saldo: ", balance);

	await page.goto('https://internetbanking.caixa.gov.br/SIIBC/interna#!/extrato_periodo.processa' , {waitUntil: 'networkidle2'});

	await page.waitForSelector('#confirma', {
		visible: true,
	});

	await page.evaluate(() => {
		document.querySelector('#rdoFormatoExtratoArquivo').click();
	});	

  await download(page, '#confirma');

	await browser.close();
})();