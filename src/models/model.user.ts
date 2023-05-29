import mongoose, { Document, Model, Schema } from 'mongoose';
mongoose.pluralize(null);

interface IUser {
  appBuildNumber?: number;
  appVersion?: string;
  devTokens?: string[];
  email: string;
  name?: string;
  isActive?: boolean;
  isNotificationsEnabled?: boolean;
  timestampLastLogin?: Date | null;
  timestampLastLoginDevice?: string | null;
  userId: string;
  profileImageUrl?: string;

  subStripeEnd: Date | null;
  subStripeLivemode: boolean | null;
  subStripePlan: string | null;
  subStripePlanAmt: number | null;
  subStripePlanId: string | null;
  subStripeStart: Date | null;
  subStripeStatus: string | null;

  stripeLiveCustomerId: string | null;
  stripeTestCustomerId: string | null;

  subIsLifetime: false;
  subHasSubsciption: false;
  subSubscriptionEndDate: null;

  subRevenueCatIsActive: boolean;
  subRevenueCatWillRenew: boolean;
  subRevenueCatPeriodType: '';
  subRevenueCatProductIdentifier: '';
  subRevenueCatIsSandbox: boolean;
  subRevenueCatOriginalPurchaseDate: Date | null;
  subRevenueCatLatestPurchaseDate: Date | null;
  subRevenueCatUnsubscribeDetectedAt: Date | null;
  subRevenueCatBillingIssueDetectedAt: Date | null;
}

export type IUserDocument = IUser & Document;

interface IUserModel extends Model<IUserDocument> {
  build(attr: IUser): IUserDocument;
}

const UserSchema = new Schema<IUserDocument>(
  {
    appBuildNumber: { type: Number },
    appVersion: { type: String },
    devTokens: { type: [String] },
    email: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isNotificationsEnabled: { type: Boolean, default: true },
    timestampLastLogin: { type: Date },
    timestampLastLoginDevice: { type: String },
    userId: { type: String, required: true },

    subStripeEnd: { type: Date },
    subStripeLivemode: { type: Boolean },
    subStripePlan: { type: String },
    subStripePlanAmt: { type: Number },
    subStripePlanId: { type: String },
    subStripeStart: { type: Date },
    subStripeStatus: { type: String },

    stripeLiveCustomerId: { type: String, default: null },
    stripeLiveCustomerEmail: { type: String, default: null }
  },

  { timestamps: { createdAt: 'timestampCreated', updatedAt: 'timestampUpdated' } }
);

UserSchema.statics.build = (attr: IUser) => {
  return new User(attr);
};

const User = mongoose.model<IUserDocument, IUserModel>('users', UserSchema);

export { User };
