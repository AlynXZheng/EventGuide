import { Model, Schema, model } from "mongoose";
//const bcrypt = require("bcrypt");
import { Password } from "../services/password";

// 1. Create an interface representing a document in MongoDB.
interface User {
  name: string;
  email: string;
  password: string;
}

interface UserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
}

type UserModel = Model<User, {}, UserMethods>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

//pre hook that encrypts the password
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.hashPassword(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   //hash the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await Password.comparePassword(candidatePassword, userPassword);
};

// 3. Create a Model.
const UserModel = model<User, UserModel>("User", userSchema);

export { UserModel };

// import mongoose from "mongoose";
// import { Password } from "../services/password";

// // An interface that describes the properties
// // that are requried to create a new User
// interface UserAttrs {
//   email: string;
//   password: string;
// }

// // An interface that describes the properties
// // that a User Model has
// interface UserModel extends mongoose.Model<UserDoc> {
//   build(attrs: UserAttrs): UserDoc;
// }

// // An interface that describes the properties
// // that a User Document has
// interface UserDoc extends mongoose.Document {
//   email: string;
//   password: string;
// }

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// userSchema.pre("save", async function (done) {
//   if (this.isModified("password")) {
//     const hashed = await Password.toHash(this.get("password"));
//     this.set("password", hashed);
//   }
//   done();
// });

// userSchema.statics.build = (attrs: UserAttrs) => {
//   return new User(attrs);
// };

// const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

// export { User };
