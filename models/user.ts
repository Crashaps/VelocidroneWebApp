import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema, Model } from "mongoose";

const MINIMUMPASSWORDLENGTH = 8;

interface IUserData extends Document {
    name: string;
    password: string;
    email: string;
    token: string;
    apiKey: string;
}

const UserDataSchema: Schema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    token: String,
    apiKey: String
});

const UserData: Model<IUserData> = mongoose.model<IUserData>("UserData", UserDataSchema);

class User extends UserData {
    constructor();
    constructor(user?: IUserData) {
        super();

        this.name = user?.name ?? "";
        this.password = user?.password ?? "";
        this.email = user?.email ?? "";
        this.token = user?.token ?? "";
        this.apiKey = user?.apiKey ?? "";

        this._id = user?._id ?? new mongoose.Types.ObjectId();
        this.isNew = user?.isNew ?? true;
    }

    async save(): Promise<this> {
        if (!this.isPasswordHashed()) {
            this.password = await bcrypt.hash(this.password, 8);
        }

        return await super.save();
    }

    isPasswordHashed(): boolean {
        try {
            bcrypt.getSalt(this.password);
            return true;
        }
        catch (error) {
            return false;
        }
    }

    validate(): Promise<void> {
        if (!validator.isEmail(this.email)) {
            throw new Error("Invalid Email format.");
        }
        if (this.password.length < MINIMUMPASSWORDLENGTH) {
            throw new Error(`Password must be longer than ${MINIMUMPASSWORDLENGTH} characters.`);
        }
        if (validator.isAlphanumeric(this.password)) {
            throw new Error("Password must contain a non-alphanumeric character.");
        }

        return super.validate();
    }

    async generateAuthToken(): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const settings = require("../settings.json");

        this.token = jwt.sign({ _id: this._id }, settings.JWTKey);

        await this.save();

        return this.token;
    }

    async isPasswordMatch(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    static async getByEmail(email: string): Promise<User> {
        if (!validator.isEmail(email)) {
            throw new Error("Invalid Email format");
        }

        const userFilter = { email: email };
        const user = await this.findOne(userFilter);
        if (!user) {
            throw new Error();
        }

        return user as User;
    }

    static async getByName(name: string): Promise<User> {
        const user = await this.findOne({ name: name });
        if (!user) {
            throw new Error();
        }

        return user as User;
    }

    static async getByApiKey(apiKey: string): Promise<User> {
        const user = await this.findOne({ apiKey: apiKey });
        if (!user) {
            throw new Error();
        }

        return user as User;
    }

    static async getByToken(id: string, token: string): Promise<User> {
        const userFilter = { "_id": id, token: token };

        try {
            const user = await this.findOne(userFilter);
            if (!user) {
                throw new Error();
            }

            return user as User;
        }
        catch (error) {
            throw new Error("Unauthorized");
        }
    }

    static async emailExists(email: string): Promise<boolean> {
        try {
            const user = await User.getByEmail(email);
            return user !== null;
        }
        catch (error) {
            return false;
        }
    }

    static async findByIds(ids: Array<string>): Promise<Array<User>> {
        const users = await this.find({ _id: { $in: ids } });
        return users as Array<User>;
    }

    static createUser(name: string, password: string, email: string): User {
        const user = new User();
        user.name = name;
        user.password = password;
        user.email = email;
        return user;
    }
}

export default User;
