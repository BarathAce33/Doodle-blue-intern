import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    placeOrder(req: any, body: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, {}> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateOrder(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, {}> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
