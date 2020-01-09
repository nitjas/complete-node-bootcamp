const nodemailer = require('nodemailer');

// to, subject, email content,...
const sendEmail = async options => {
  // 1) Create a teansporter - a service like gmail (not node.js) that will send the email
  const gTransporter = nodemailer.createTransport({
    service: 'Gmail', // couple of well known well known services that nodemailer knows how to deal with- no manual configuration yahoo hotmail etc too
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD
    }
    // in your gmail you will have to configure something called the less secure app option
    // Activate in gmail "Less secure app" option https://myaccount.google.com/lesssecureapps?pli=1
    // We are not using Gmail, because Gmail is not at all a good idea for a production app
    // Using Gmail you can send only 500 emails per day, you will very quickly be marked as a spammer and from there it will only go downhill!.. unless it's like a private app where you send email to yourself or 10 friends you should use aother service
    // some well known ones are sendgrid and mailgun .. we'll use sendgrid
    // for now we will use a special development service which fakes to send emails to real addresses, but in reality these emails end up trapped in a development inbox so that we can then take a loko at how they will look later in production
    // that service is mail trap https://mailtrap.io/ .. let's sign up!
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Anantadyant Singh <nitjas@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message // text version of the email, but we can also specify the html property
    // html:    // for later
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions); // we could store the result, but not interested
};

module.exports = sendEmail;
