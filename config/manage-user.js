let database = require('../config/database/connection')
let collections = require('../config/database/collection')

module.exports = {
	listUser(callback){
		database.fetch().collection(collections.USER_COLLECTION).find({}).toArray().then(data => {
			callback(error=false, data)
		})
		.catch(err => {
			callback(error=false, err)
		})
	}
}
