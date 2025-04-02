async function generateUniqueEntityId(prefix, Model) {
  let newId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    const randomLetters = String.fromCharCode(
      65 + Math.floor(Math.random() * 26), // Random uppercase letter A-Z
      65 + Math.floor(Math.random() * 26) // Another random uppercase letter A-Z
    );
    newId = `${prefix}${randomNumber}${randomLetters}`; // Example: STAFF_1234

    // Check if the ID already exists in the database
    const existingStaff = await Model.findOne({ where: { id: newId } });
    if (!existingStaff) exists = false;
  }

  return newId;
}

module.exports = generateUniqueEntityId;
