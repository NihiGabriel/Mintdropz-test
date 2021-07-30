const fs = require('fs');
const colors = require('colors');

const User = require('../../models/User.model');

// read in the seed file
const users = JSON.parse(
	fs.readFileSync(`${__dirname.split('config')[0]}_data/users.json`, 'utf-8')
);

exports.seedUsers = async () => {

    try {

        const u = await User.find({}); // fetch all data in users table
        if (u && u.length > 0) return;

        const seed = await User.create(users);

        if(seed){
            console.log('Users seeded successfully.'.green.inverse);
        }

    } catch (err) {
        console.log(`${err}`.red.inverse);
    }

}