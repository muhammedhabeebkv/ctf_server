const {MongoClient} = require('mongodb')

const state = {
	db:null
}

module.exports.connect = async (callback) => {
	const url = "mongodb://127.0.0.1:27017"
	const databaseName = "ctf_server"
	try{
		const data =await MongoClient.connect(url)
		
		state.db = data.db(databaseName)
		callback("Database Connection Established.")
	}
	catch(Err){
		callback(Err)
	}
}

module.exports.fetch = () => {
	return state.db
}