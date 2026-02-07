import mongoose, { Schema, Document } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  emailVerified: boolean;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  name: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

// Profile
export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyStatus?: "listed" | "unlisted";
  industrySector?: string;
  companySize?: "small" | "medium" | "large";
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  companyStatus: {
    type: String,
    enum: ["listed", "unlisted"],
  },
  industrySector: String,
  companySize: {
    type: String,
    enum: ["small", "medium", "large"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Profile =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", profileSchema);

// Thread
export interface IThread extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  mode: "personal" | "community";
  createdAt: Date;
  updatedAt: Date;
}

const threadSchema = new Schema<IThread>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ["personal", "community"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
threadSchema.index({ userId: 1, mode: 1 });
threadSchema.index({ mode: 1 });

export const Thread =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", threadSchema);

// Message
export interface ICitation {
  title: string;
  source: string;
}

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  senderType: "user" | "ai";
  content: string;
  citations?: ICitation[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderType: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  citations: [
    {
      title: String,
      source: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ threadId: 1 });
messageSchema.index({ userId: 1 });

export const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

// Community Doubt
export interface ICommunityDoubt extends Document {
  threadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  question: string;
  createdAt: Date;
}

const communityDoubtSchema = new Schema<ICommunityDoubt>({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

communityDoubtSchema.index({ threadId: 1 });

export const CommunityDoubt =
  mongoose.models.CommunityDoubt ||
  mongoose.model<ICommunityDoubt>("CommunityDoubt", communityDoubtSchema);
