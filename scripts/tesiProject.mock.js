require('dotenv').config()
require('web3')
const colors = require('colors')
const SharedUtils = require('../shared/utils')

// Get all mocked projects.
const mockedProjects = require('../mocks/projects.json')



// library for define Telegram bot directive
const TelegramBot = require('node-telegram-bot-api')
const token = '1515680414:AAEVqXyNtzTs30H16cB_eZh1dtv0d3v4ESQ'
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



  const max = 100;
  const min = 0;
  let val = (Math.random() * (max - min) + min).toFixed(0);

  trsct1 = await this.crowdfundingInstance.methods.addPrice(
    	"eurusd", 
    	val
  ).send({
  	...this.transactionParameters,
  	from: (await web3.eth.getAccounts())[0],
  })
  console.log(`\n${colors.green('Everything is fine.')}`)


  console.log(`\n\n\n${colors.green('Data send to blockchain: ')}` + val);

  console.log("Loading: ...   SUCCESS");

  const trsct2 = await this.crowdfundingInstance.methods.getLastPP()
  .send({
    ...this.transactionParameters,
    from: (await web3.eth.getAccounts())[0],
  })

  const trsct2Address = trsct2.events.pricePrediction.returnValues.pp

  console.log(`\n${colors.green('Data get from blockchain')} -> (${colors.magenta(trsct2Address)})`)


  bot.onText(/\/get/, (msg) => {
  	bot.sendMessage(msg.chat.id, trsct2Address);
  });

  return true
}

console.log("in")

// Required by `truffle exec`
module.exports = function (callback) {
  return new Promise((resolve, reject) => {
    main()
      .then((value) => resolve(value))
      .catch(err => {
        console.log('Error:', err)
        reject(err)
      })
  })
}
