const bcrypt = require('bcrypt');
const pw = process.argv[2];
const saltRounds = 10;

bcrypt.hash(pw, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return false;
  }

  console.log("HASH: ", hash);
});