import { Model } from 'mongoose';
import { OrderDocument } from '../orders/schemas/order.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { ProductDocument } from '../products/schemas/product.schema';
export declare class ReportsService {
    private orderModel;
    private userModel;
    private productModel;
    constructor(orderModel: Model<OrderDocument>, userModel: Model<UserDocument>, productModel: Model<ProductDocument>);
    generateOrdersReport(startTime: string, endTime: string, sortBy?: string): Promise<any>;
}
