import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [{ productId: String, quantity: Number }], required: true })
  products: { productId: string; quantity: number }[];

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
