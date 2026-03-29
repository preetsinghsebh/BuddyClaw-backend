import '../shared/env.js';
import { connectDB } from '../shared/database.js';
import BuddyUser from './models/User.js';

async function findLatestUser() {
    await connectDB();
    const user = await BuddyUser.findOne().sort({ createdAt: -1 });
    if (user) {
        console.log(`FOUND_USER_ID: ${user.userId}`);
    } else {
        console.log('NO_USER_FOUND');
    }
    process.exit(0);
}

findLatestUser();
