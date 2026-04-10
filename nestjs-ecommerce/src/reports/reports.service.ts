import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Parser } from 'json2csv';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async generateOrdersReport(startTime: string, endTime: string, sortBy: string = 'createdAt') {
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // query
    const orders = await this.orderModel
      .find({ createdAt: { $gte: start, $lte: end } })
      .sort({ [sortBy]: 1 })
      .lean();

    const reportData = [];

    for (const order of orders) {
      const user = await this.userModel.findById(order.userId).lean();
      
      for (const item of order.products) {
        const product = await this.productModel.findById(item.productId).lean();
        
        // mapping
        reportData.push({
          orderId: order._id.toString(),
          orderStatus: order.status,
          orderDate: order.createdAt,
          orderTotalAmount: order.totalAmount,
          userId: user ? user._id.toString() : order.userId,
          userName: user ? user.name : 'N/A',
          userEmail: user ? user.email : 'N/A',
          productId: product ? product._id.toString() : item.productId,
          productTitle: product ? product.title : 'N/A',
          productPrice: product ? product.price : 0,
          quantityPurchased: item.quantity
        });
      }
    }

    if (reportData.length === 0) {
      throw new BadRequestException('No data found for the given time range');
    }

    // csv
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(reportData);
    
    return csv;
  }
}
