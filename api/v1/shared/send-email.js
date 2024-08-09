//const nodemailer = require('nodemailer');
const path = require('path');
const config = require(path.join(__dirname, '../config.json'));

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

module.exports = sendEmail;

async function sendEmail({ to, subject, html }) {

	// Configure API key authorization: api-key
	let apiKey = defaultClient.authentications['api-key'];
	apiKey.apiKey = config.sendinblue.apiKey;

	let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

	let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
	sendSmtpEmail = {
		sender: {
			email: 'noreply@cmdbanner.io',
			name: 'SWITCH\\ CMDBanner.io'
		},
		to: [{
			email: to
		}],
		subject: subject,
		htmlContent: html,
		//templateId: 59,
		//params: {
		//	name: 'Max',
		//	surname: 'Sibande'
		//},
		headers: {
			'api-key': config.sendinblue.apiKey,
			'content-type': 'application/json',
			'accept': 'application/json',
			//'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
		}
	};

	await apiInstance.sendTransacEmail(sendSmtpEmail).then( function(data) {
			////console.log('Email API called successfully. Returned data: ' + data);
		}, function(error) {
			console.error(error);
		}
	);

    //const transporter = nodemailer.createTransport(config.smtpOptions);
    //await transporter.sendMail({ from, to, subject, html });
}
