/* eslint-disable no-await-in-loop */

const functions = require('firebase-functions');
const { covid: getTelegraf} = require('./telegraf.js')
const covid19 = require('covid19-api')
const Jimp = require('jimp')
const zno_stickers = require('./zno_stickers')

const telegraf = (async () => await getTelegraf())()

telegraf.on('message', (ctx) => {
	ctx.reply('Привет, я не могу ничего ответить тебе, так как моя единственная задача это обновлять стикеры!')
})

const backgrounds = {
	cases_ukraine: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/cases-ukraine.png?alt=media&token=ceec867b-60f1-47de-ae48-8ef30d474c2d',
	recovered_ukraine: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/recovered-ukraine.png?alt=media&token=bb514f2b-fb2f-4169-abca-fccbf43ccf48',
	deaths_ukraine: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/deaths-ukraine.png?alt=media&token=c3a69431-d660-4e14-bd2f-4e195092d46e',
	active_ukraine: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/active-ukraine.png?alt=media&token=977e3070-9a5b-489a-8363-b919a21577c8',
	cases_worldwide: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/cases-worldwide.png?alt=media&token=008c9c8e-36a1-4d7a-ab27-3567fa880d9d',
	deaths_worldwide: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/deaths-worldwide.png?alt=media&token=859aa7b4-4386-4f84-9d19-ac2b335c4586',
	recovered_worldwide: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/recovered-worldwide.png?alt=media&token=ad859c08-5eb8-4814-9050-54e07b992276',
	active_worldwide: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/active-worldwide.png?alt=media&token=a3ac5e67-05d9-48b1-91e1-2c401c80cf39',
}

const emojis = {
	deaths: '😵☠️💀',
	recovered: '❤️😇',
	cases: '🤕☣️',
	active: '😷🤧🤢',
	ukraine: '🇺🇦',
	worldwide: '🌍'
}

const tableDict = {
	cases: 'TotalCases',
	active: 'ActiveCases',
	deaths: 'TotalDeaths',
	recovered: 'TotalRecovered',
}

function leadZero(num) {
	if (num < 9) {
		return `0${num}`
	} else {
		return `${num}`
	}
}

function formatTime(date) {
	const year = date.getFullYear().toString()
	const month = leadZero((date.getMonth() + 1))
	const day = leadZero(date.getDate())
	const hours = leadZero(date.getUTCHours() + 3)
	const mins = leadZero(date.getMinutes())
	return `(${hours}:${mins} ${day}.${month}.${year})`
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function genetateCoronaSticker(text, template, time) {
	return new Promise(async (resolve) => {
		const image = await Jimp.read(backgrounds[template])

		const title_font = await Jimp.loadFont('./title.fnt')
		const subtitle_font = await Jimp.loadFont('./sub-title.fnt')

		// const width = await Jimp.measureText(title_font, text.toString());
		// await image.print(font, ((512 - width) / 2), 215, text.toString());
		await image.print(title_font, 38, 182, text.toString());
		await image.print(subtitle_font, 38, 276, formatTime(time))

		const buff = await image.getBufferAsync(Jimp.MIME_PNG)
		resolve(buff)
		return null;
	})
}

exports.telegramWebhook = functions.region('europe-west1').https.onRequest(async (request, response) => {
	const data = request.body
	await telegraf.handleUpdate(request.body, response)
})

exports.updateStickers = functions.region('europe-west1').runWith({timeoutSecounds: 300}).pubsub.schedule('every 15 minutes').onRun(async (context) => {
// exports.updateStickers = functions.region('europe-west1').https.onRequest(async (request, response) => {
	const data = await covid19.getReports()
	const ukraine = data[0][0].table
		.reduce((ac, el) => ([...ac, ...el]), [])
		.find(el => el.Country === 'Ukraine')
	const time = new Date()

	for (type of ['cases', 'deaths', 'recovered', 'active']) {
		for (place of ['worldwide', 'ukraine']) {
			console.log({type, place})
			let type_data;
			if (type !== 'active' && place !== 'ukraine') {
				type_data = data[0][0][type]
			} else {
				if (place === 'ukraine') {
					type_data = ukraine[tableDict[type]]
				} else {
					console.log('act', data[0][0].active_cases)
					type_data = data[0][0].active_cases[0].currently_infected_patients || ''
				}
			}

			const stickerImage = await genetateCoronaSticker(numberWithCommas(type_data), `${type}_${place}`, time)
			try {
				await telegraf.telegram.addStickerToSet(
					"318951201", 
					'coronadata_by_coronasticker_bot',
					{
						png_sticker: {
							source: stickerImage
						},
						emojis: '🦠' + (emojis[type] || '') + (emojis[place] || '')
					}
				)
			} catch(err) {
				console.log(err)
				// response.json(err)
			}
			await new Promise(res => setTimeout(() => res(), 1000))
		}
	}

	const sticker_set = await telegraf.telegram.getStickerSet('coronadata_by_coronasticker_bot')
	const stickers_to_delete = sticker_set.stickers.slice(0, sticker_set.stickers.length - 8).map(el => el.file_id)
	console.log(sticker_set, stickers_to_delete)
	try {
		for (stickerId of stickers_to_delete) {
			console.log('delete', stickerId)
			await telegraf.telegram.deleteStickerFromSet(stickerId)
			await new Promise(res => setTimeout(() => res(), 1000))
		}
	} catch(err) {
		console.log(err)
		// response.json(err)
	}
	

	// response.json({data, sticker_set, stickers_to_delete})
})

// exports.zno_stickers = functions.region('europe-west1').runWith({timeoutSecounds: 300}).https.onRequest(zno_stickers)
exports.zno_stickers = functions
	.region('europe-west1')
	.runWith({timeoutSecounds: 300})
	.pubsub
	.schedule('00 7 * * *')
	.timeZone('Europe/Kiev')
	.onRun(zno_stickers)