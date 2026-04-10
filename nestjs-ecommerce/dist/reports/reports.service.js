"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const json2csv_1 = require("json2csv");
let ReportsService = class ReportsService {
    constructor(orderModel, userModel, productModel) {
        this.orderModel = orderModel;
        this.userModel = userModel;
        this.productModel = productModel;
    }
    async generateOrdersReport(startTime, endTime, sortBy = 'createdAt') {
        if (!startTime || !endTime) {
            throw new common_1.BadRequestException('startTime and endTime are required');
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        const orders = await this.orderModel
            .find({ createdAt: { $gte: start, $lte: end } })
            .sort({ [sortBy]: 1 })
            .lean();
        const reportData = [];
        for (const order of orders) {
            const user = await this.userModel.findById(order.userId).lean();
            for (const item of order.products) {
                const product = await this.productModel.findById(item.productId).lean();
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
            throw new common_1.BadRequestException('No data found for the given time range');
        }
        const json2csvParser = new json2csv_1.Parser();
        const csv = json2csvParser.parse(reportData);
        return csv;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map