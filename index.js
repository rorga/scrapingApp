const playwright = require('playwright');
const fs = require('fs');
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const { encryptedPassword, secretKey } = require('./config');

// Descifrar la contraseña
const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, secretKey).toString(CryptoJS.enc.Utf8);

async function main() {

    // Configurar el transporte SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'scrapapporga@gmail.com',
            pass: decryptedPassword
        }
    });

    // Configurar los detalles del correo electrónico
    const mailOptions = {
        from: 'scrapapporga@gmail.com',
        to: 'raul_orga@hotmail.com',
        subject: '¡¡NUEVO PRODUCTO!!',
        html: ``
    };

    const browser = await playwright.chromium.launch({ headless: true });

    const page = await browser.newPage()

    await page.goto('https://www.global-freaks.com/es/105-wcf');

    const figuritas = await page.$$eval('.product-description', (rows) => (
        rows.map((row) => {

            const title = row.querySelector('h2 a').innerText.trim();

            return { title };
        })
    ));

    // Construir el contenido HTML del correo con las figuritas
    let emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>NUEVOS PRODUCTOS ENCONTRADOS</title>
            <style type="text/css">
                body {
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #333;
                }

                h1 {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }

                p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Entra en la página para verlos: </h1>
            <h1><a href="https://www.global-freaks.com/es/105-wcf">https://www.global-freaks.com/es/105-wcf</a></h1>
            <h2>Figuritas:</h2>
        `;

    // Agregar las figuritas al cuerpo del correo
    figuritas.forEach((figurita) => {
        emailContent += `<li>${figurita.title}</li>`;
    });

    emailContent += `
        </body>
        </html>
        `;

    // Actualizar el contenido HTML del correo en mailOptions
    mailOptions.html = emailContent;

    const fileFiguritas = fs.readFileSync("figuritas.txt").toString();
    if (fileFiguritas) {
        if (fileFiguritas !== figuritas[0].title) {
            fs.writeFileSync('figuritas.txt', figuritas[0].title.toString());
            // Enviar el correo electrónico
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error al enviar el correo electrónico:', error);
                } else {
                    console.log('Correo electrónico enviado:', info.response);
                }
            });
        } else {
            console.log('No se ha enviado el correo porque no hay nuevos articulos');
        }
    } else {
        fs.writeFileSync('figuritas.txt', figuritas[0].title.toString());
    }

    await browser.close();
}

main();