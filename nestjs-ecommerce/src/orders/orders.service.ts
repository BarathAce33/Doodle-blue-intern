import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OrdersService {
  private transporter;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async placeOrder(data: any) {
    const { userId, products } = data;
    const requestedQuantity = products.reduce((acc, curr) => acc + curr.quantity, 0);

    // today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // fetch
    const todaysOrders = await this.orderModel.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const quantityPurchasedToday = todaysOrders.reduce((acc, order) => {
      return acc + order.products.reduce((accP, currP) => accP + currP.quantity, 0);
    }, 0);

    // limit
    if (quantityPurchasedToday + requestedQuantity > 5) {
      throw new BadRequestException('Purchase limit exceeded. Max 5 products per day.');
    }

    let totalAmount = 0;
    const invoiceProducts = [];

    // inventory
    for (const item of products) {
      const product = await this.productModel.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Product ${item.productId} is out of stock`);
      }
      product.stock -= item.quantity;
      await product.save();
      totalAmount += product.price * item.quantity;

      invoiceProducts.push({ title: product.title, quantity: item.quantity, price: product.price });
    }

    const order = new this.orderModel({
      userId,
      products,
      totalAmount,
      status: 'pending'
    });

    // save
    await order.save();

    // email
    const user = await this.userModel.findById(userId);
    if (user && user.email) {
      this.sendInvoice(user.email, order._id.toString(), invoiceProducts, totalAmount).catch(console.error);
    }

    return order;
  }

  async updateOrder(id: string, data: any) {
    // update
    const order = await this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async sendInvoice(email: string, orderId: string, items: any[], total: number) {
    // template
    let text = `Your Order ${orderId} has been placed successfully!\n\n`;
    items.forEach(i => text += `${i.title} x${i.quantity} - $${i.price * i.quantity}\n`);
    text += `\nTotal: $${total}`;

    // dispatch
    await this.transporter.sendMail({
      from: '"Ecommerce App" <no-reply@ecommerce.com>',
      to: email,
      subject: 'Purchase Invoice - Order ' + orderId,
      text,
    });
  }
}
