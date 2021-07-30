const { seedRoles } = require('./role.seed');
const { seedUsers } = require('./user.seed');

exports.seedData = async () => {

    await seedRoles();
    await seedUsers();
}