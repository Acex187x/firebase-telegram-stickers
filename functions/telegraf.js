const { Telegraf } = require('telegraf')
const firebase = require('./firebase')

const db = firebase.firestore()

module.exports.zno = () => {
	return new Promise((resolve) => {
		const token = (await db.collection('secret_data').doc('znoTimerBotToken').get()).data().token
		resolve(new Telegraf(token, {
			telegram: {
		    	webhookReply: true 
			}
		}))
	})
}

module.exports.covid = () => {
	return new Promise((resolve) => {
		const token = (await db.collection('secret_data').doc('coronaBotToken').get()).data().token
		resolve(new Telegraf(token, {
			telegram: {
		    	webhookReply: true 
			}
		}))
	})
}
