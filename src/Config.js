require('dotenv').config({ path: require('find-config')('.env') })
module.exports = {
    server:{
        port: process.env.PORT
    },
    sqldb:{
        user: process.env.DUSERNAME,
        host: process.env.HOST,
        database: process.env.DBNAME,
        password: process.env.PASSWORD,
        port: process.env._PORT,
        sslmode: process.env.SSLMODE,
         ssl:{
                rejectUnauthorized:false,
        }
    },
 
}