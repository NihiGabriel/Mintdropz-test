const fs = require('fs');
const colors = require('colors');

const Role = require('../../models/Role.model');

// read in the seed file
const roles = JSON.parse(
	fs.readFileSync(`${__dirname.split('config')[0]}_data/roles.json`, 'utf-8')
);

exports.seedRoles = async () => {

    try {

        const rs = await Role.find();
        if (rs && rs.length > 0) return;

        const seed = await Role.create(roles);

        if(seed){
            console.log('Roles seeded successfully.'.green.inverse);
        }

    } catch (err) {
        console.log(`${err}`.red.inverse);
    }

}