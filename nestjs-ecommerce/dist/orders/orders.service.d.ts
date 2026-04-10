import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { UserDocument } from '../users/schemas/user.schema';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private userModel;
    private transporter;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, userModel: Model<UserDocument>);
    placeOrder(data: any): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateOrder(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private sendInvoice;
}
