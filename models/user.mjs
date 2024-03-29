//Definition of what a user is to tell Mongoose
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

// Define our model
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
});

//Before the model gets saved, run this hook function
userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Add to user schema a new method
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);

    callback(null, isMatch);
  });
};

// Create the model class
const ModelClass = mongoose.model("users", userSchema);

// Export the model
export default ModelClass;
