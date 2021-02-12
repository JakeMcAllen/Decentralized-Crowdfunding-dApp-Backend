require('dotenv').config()
require('web3')

const colors = require('colors')
const SharedUtils = require('../shared/utils')

// library for define Telegram bot directive
const TelegramBot = require('node-telegram-bot-api')
const token = '1673700261:AAF_fWmmmiCZwnZuH6zhEAyyEZrBTBjnV-o'
const bot = new TelegramBot(token, {polling: true})



async function main () {
  // Initialize test utilities class.
  await SharedUtils.init(web3)

  // Get the default transaction parameters.
  this.transactionParameters = SharedUtils.getTransactionParameters()

  // Get a new Crowdfunding SC instance.
  console.log(`\n${colors.white('Deploying Crowdfunding SC...')}`)
  this.crowdfundingInstance = await SharedUtils.createNewCrowdfundingInstance()
  console.log(`\n${colors.green('Crowdfunding SC Address')} -> (${colors.magenta(this.crowdfundingInstance._address)})`)
  console.log(`\n${colors.white('-------------------------------------------------------------------')}`)

  console.log(`\n${colors.green('Everything is fine.')}`)

  let val = 3;

  for (let i=0; i < 10; i++) {
	const trsct1 = await this.crowdfundingInstance.methods.addPrice(
    		"eurusd", 
    		val
  	).send({
  		...this.transactionParameters,
    		from: (await web3.eth.getAccounts())[0],
  	})
        
	console.log('val: ' + val);
	val++;
  }	

  console.log(`\n\n\n${colors.green('Data send to blockchain: ')}` + val);

  console.log("Loading: ...   SUCCESS");

  const trsct2 = await this.crowdfundingInstance.methods.getLastPP()
  .send({
    ...this.transactionParameters,
    from: (await web3.eth.getAccounts())[0],
  })

    const trsct2Address = trsct2.events.crtIDRtrn.returnValues.currentID

        console.log(`\n${colors.green('Data get from blockchain')} -> (${colors.magenta(trsct2Address)})`)


  return true
}




// bot.start((cxt) => { ctx.reply('Benvenuto nel traderBot!') })  // context.reply('Servizio ECHO avviato')

// bot.help((ctx) => { ctx.reply('help message'); })

bot.onText(/\/ciao/, (ctx, match) => { bot.sendMessage(ctx.chat.id, 'ciao'); })

bot.onText(/\/set/, (ctx, match) => { 


})


bot.onText(/\/get/, (ctx, match) => {
	
	console.log('0');


	// Required by `truffle exec`

  	   return new Promise((resolve, reject) => {
             main()
             .then((value) => resolve(value))
             .catch(err => {
        	console.log('Error:', err)
        	reject(err)
             })
  	   })

/*
	     main()
             .then((value) => resolve(value))
             .catch(err => {
        	console.log('Error:', err)
        	reject(err)
             })

*/
	console.log('1' + addPrice());

})


console.log(`\n${colors.green('Everything is fine.')}`)









