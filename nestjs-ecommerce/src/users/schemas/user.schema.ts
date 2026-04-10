import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string; // Optional for Social logins

  @Prop()
  googleId?: string;

  @Prop({ type: [String], default: [] })
  wishlist: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
