require('dotenv').config()
require('web3')

async function main () {
  // A web3 provider comes from truffle.
  // Through `truffle exec` command we execute this function using that web3 provider.
  // NB. The web3 provider comes from --network parameter specified (development or testnet).
  if (!web3) {
    throw Error('Something went wrong with the web3 provider. Did you have run the command using truffle exec?')
  }

  // Your script code here.
  console.log(web3.version)
}

// Required by `truffle exec`
module.exports = function () {
  return new Promise((resolve, reject) => {
    main()
      .then((value) => resolve(value))
      .catch(err => {
        console.log('Something went wrong: ', err)
        reject(err)
      })
  })
}
