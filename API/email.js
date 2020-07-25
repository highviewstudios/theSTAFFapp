require('dotenv').config();
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

let mailer;

function BuildMailer() {

    if(process.env.MAILER == "local") {

        module.exports.mail = mailer = nodemailer.createTransport({
            host: "webmail.high-view-studios.co.uk",
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
            user: "staff-development@high-view-studios.co.uk", // generated ethereal user
            pass: "@RyanSian789", // generated ethereal password
            },
            tls:{
                rejectUnauthorized: false
            }
        });

        mailer.use('compile', hbs({
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'API/email/mainLayout/',
                defaultLayout: 'main',
                helpers: {
                    eqlsTo: function(value, equalsTo, options) {
                        return (value == equalsTo) ? options.fn(this) : options.inverse(this);
                    }
                }
            },
            viewPath: './API/email/templates/',
            extName: '.hbs'
        }));

        //console.log(mailer);
    } else {

        module.exports.mail = mailer = nodemailer.createTransport({
            host: "webmail.high-view-studios.co.uk",
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
            user: process.env.EMAIL_ADDRESS, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD, // generated ethereal password
            }
        });

        mailer.use('compile', hbs({
            viewEngine: {
                extname: 'hbs',
                layoutsDir: 'API/email/mainLayout/',
                defaultLayout: 'main'
            },
            viewPath: './API/email/templates/',
            extName: '.hbs'
        }));

    }
}

module.exports = BuildMailer;
