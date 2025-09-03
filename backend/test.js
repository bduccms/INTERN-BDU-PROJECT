// test.js
import { hashPassword, comparePassword } from './hash.js';

async function run() {
  const password = 'mySecret123';

  // Hash the password
  const hashed = await hashPassword(password);
  console.log('Hashed password:', hashed);

  // Verify password
  const isMatch = await comparePassword('mySecret123', hashed);
  console.log('Password match:', isMatch);
}

run();
