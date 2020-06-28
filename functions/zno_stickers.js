/* eslint-disable no-await-in-loop */

const functions = require('firebase-functions');
const Jimp = require('jimp')
channel_id = `@ZNO_timer`
const { zno: telegraf } = require('./telegraf')

telegraf.on('message', (ctx) => {
	ctx.reply('Привет, я не могу ничего ответить тебе, так как моя единственная задача это обновлять стикеры!')
})

const zno_times = [
	{
		name: 'Пробне \\(Мова\\)',
		emoji: '🇺🇦',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/prob_urk.png?alt=media&token=7feef5e7-5c94-454b-9765-000835c5d0c4',
		time: [15, 6]
	},
	{
		name: 'Пробне \\(Інші\\)',
		emoji: '🌚',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/prob_ins.png?alt=media&token=ec7aba31-00b2-402e-a9cf-8b6cdc85be26',
		time: [17, 6]
	},
	{
		name: 'Основна сессія',
		emoji: '📄',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/osn.png?alt=media&token=8c01b75b-22b3-4b94-9dab-7cc42eec13b3',
		time: [25, 6]
	},
	{
		name: 'Математика',
		emoji: '📐',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/matesha.png?alt=media&token=faad4d16-cc9d-4c54-a05e-7fc122a01a0b',
		time: [25, 6]
	},{
		name: 'Укр\\. мова',
		emoji: '🇺🇦',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/ukrmova.png?alt=media&token=9c1be617-2330-4e89-b76b-c4f93cee256b',
		time: [30, 6]
	},{
		name: 'Фізика',
		emoji: '🚀',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/fiza.png?alt=media&token=79e1d9e5-9488-4059-9d18-3bec0dfa431a',
		time: [2, 7]
	},{
		name: 'Іноз\\. мови',
		emoji: '👅',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/inoz.png?alt=media&token=05f564db-4554-471d-81a4-36a39f5c5a2a',
		time: [6, 7]
	},{
		name: 'Англ\\. мова',
		emoji: '🇬🇧',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/angl.png?alt=media&token=348b2bf5-9f3a-4f78-b3dc-6fd78b7064a7',
		time: [7, 7]
	},{
		name: 'Історія',
		emoji: '📜',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/history.png?alt=media&token=ffbb0deb-e464-49a3-94b6-e0773a3d1932',
		time: [9, 7]
	},{
		name: 'Біологія',
		emoji: '🦋',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/bio.png?alt=media&token=8a16341c-fd1d-4630-ba9e-02cd0e7d8da0',
		time: [13, 7]
	},{
		name: 'Географія',
		emoji: '🌍',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/geo.png?alt=media&token=21662f0f-0ad3-4e7a-8c88-6130fa0cbeb1',
		time: [15, 7]
	},{
		name: 'Хімія',
		emoji: '🧪',
		background: 'https://firebasestorage.googleapis.com/v0/b/telegram-botz.appspot.com/o/himiya.png?alt=media&token=1fd30627-c781-4feb-ad21-a38289c1a59e',
		time: [17, 7]
	}
]
function getNumEnding(iNumber, aEndings){
    let sEnding, i;
    iNumber = iNumber % 100;
    if (iNumber>=11 && iNumber<=19) {
        sEnding=aEndings[2];
    }
    else {
        i = iNumber % 10;
        switch (i)
        {
            case (1): sEnding = aEndings[0]; break;
            case (2):
            case (3):
            case (4): sEnding = aEndings[1]; break;
            default: sEnding = aEndings[2];
        }
    }
    return sEnding;
}

const znoEmoji = ['⛈', '😖', '🤯', '😰', '😢', '😤', '😥', '🤬', '😱', '😭', '👿', '👺', '👹', '👻', '💀', '😾', '🙅‍♂️', '🤦‍♀️', '🤦‍♂️', '🖕', '👎', '🎲', '📉', '📝', '✏️', '📚', '🆘', '🔞', '📛', '‼️', '⚠️', '❌', '🛑', '🙄']
const getRandomEmojiZNO = () => {
    return znoEmoji[~~(Math.random() * znoEmoji.length)]
}

function formatZnoTimes() {
	return `${zno_times.reduce((ac, el) => {

		const time = new Date()
		time.setDate(el.time[0])
		time.setMonth(el.time[1] - 1)

		const end = Date.now() > time
		const today = new Date().getDate() === el.time[0] && (new Date().getMonth() + 1) === el.time[1]
		// const today = true
		const days = end || today
			? (today ? `Сьогодні 👿\\!` : '🎉 Здано\\! 🥳')
			: `${~~((time - Date.now()) / 86400000)} ${getNumEnding(~~((time - Date.now()) / 86400000), ['день', 'дні', 'днів'])}`

		const date = `\\(${leadZero(time.getDate())}\\.${leadZero(time.getMonth() - 1)}\\)`

		return ac + `\n${el.emoji} ${end ? '~' : ''}${el.name}:${end ? '~' : ''} *${days}*`
	}, `${getRandomEmojiZNO()} До ЗНО по предметам залишилося:`)}`
}

function leadZero(num) {
	if (num < 10) {
		return `0${num}`
	} else {
		return `${num}`
	}
}

function formatTime(date) {
	const year = date.getFullYear().toString()
	const month = leadZero((date.getMonth() + 1))
	const day = leadZero(date.getDate())
	return `(${day}.${month}.${year})`
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function genetateSticker(template) {
	return new Promise(async (resolve) => {
		const image = await Jimp.read(template.background)

		const title_font = await Jimp.loadFont('./big-title.fnt')
		const subtitle_font = await Jimp.loadFont('./zno-sub-title.fnt')

		const time = new Date()
		time.setDate(template.time[0])
		time.setMonth(template.time[1] - 1)
		
		const end = Date.now() > time
		const today = new Date().getDate() === template.time[0] && (new Date().getMonth() + 1) === template.time[1]
		// const today = true
		const days = end || today
			? (today ? `Успiху!` : 'Здано!')
			: `${~~((time - Date.now()) / 86400000)} ${getNumEnding(~~((time - Date.now()) / 86400000), ['день', 'дні', 'днів'])}`

		// const days = ~~((time - Date.now()) / 86400000)
		// const width = await Jimp.measureText(title_font, text.toString());
		// await image.print(font, ((512 - width) / 2), 215, text.toString());
		await image.print(title_font, 38, 150, `${days}`);
		await image.print(subtitle_font, 38, 273, formatTime(new Date()))

		const buff = await image.getBufferAsync(Jimp.MIME_PNG)
		resolve(buff)
		return null;
	})
}

// function updateZnoStickers(context) {
async function updateZnoStickers(context) {
	for (template of zno_times) {
		const stickerImage = await genetateSticker(template)
		try {
			await telegraf.telegram.addStickerToSet(
				"318951201", 
				'zno_by_school_holidays_timer_post_bot',
				{
					png_sticker: {
						source: stickerImage
					},
					emojis: template.emoji
				}
			);
			if (template.name === 'Основна сессія') {
				await telegraf.telegram.sendPhoto(
					channel_id,
					{
						source: stickerImage
					},
					{
						parse_mode: 'MarkdownV2',
						caption: formatZnoTimes(),
						reply_markup: {
							inline_keyboard: [[
								{
									text: 'Стікери з відліком до ЗНО',
									url: 'https://t.me/addstickers/zno_by_school_holidays_timer_post_bot'
								}
							]]
						}
					}
				);
				// await telegraf.telegram.sendMessage(
				// 	318951201,
				// 	formatZnoTimes()
				// );
			}
		} catch(err) {
			console.log(err)
			// response.json(err)
		}
		await new Promise(res => setTimeout(() => res(), 1000))
	}

	const sticker_set = await telegraf.telegram.getStickerSet('zno_by_school_holidays_timer_post_bot')
	// const stickers_to_delete = sticker_set.stickers.map(el => el.file_id)
	const stickers_to_delete = sticker_set.stickers.slice(0, sticker_set.stickers.length - zno_times.length).map(el => el.file_id)
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

	// const stickerImage = await genetateSticker(zno_times[0])
	// const data = await telegraf.telegram.createNewStickerSet(
	// 	"318951201", 
	// 	'zno_by_school_holidays_timer_post_bot',
	// 	'Час до ЗНО',
	// 	{
	// 		png_sticker: {
	// 			source: stickerImage
	// 		},
	// 		emojis: '☠️'
	// 	}
	// )
	

	// response.json({data})
}

module.exports = updateZnoStickers