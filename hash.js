const argon2 = require('argon2');

async function hashPassword() {
  try {
    const hash = await argon2.hash('123456');
    console.log('HASH PASSWORD:');
    console.log(hash);
  } catch (err) {
    console.error(err);
  }
}

hashPassword();