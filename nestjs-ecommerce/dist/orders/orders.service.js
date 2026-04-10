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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const nodemailer = require("nodemailer");
let OrdersService = class OrdersService {
    constructor(orderModel, productModel, userModel) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.userModel = userModel;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async placeOrder(data) {
        const { userId, products } = data;
        const requestedQuantity = products.reduce((acc, curr) => acc + curr.quantity, 0);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const todaysOrders = await this.orderModel.find({
            userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        const quantityPurchasedToday = todaysOrders.reduce((acc, order) => {
            return acc + order.products.reduce((accP, currP) => accP + currP.quantity, 0);
        }, 0);
        if (quantityPurchasedToday + requestedQuantity > 5) {
            throw new common_1.BadRequestException('Purchase limit exceeded. Max 5 products per day.');
        }
        let totalAmount = 0;
        const invoiceProducts = [];
        for (const item of products) {
            const product = await this.productModel.findById(item.productId);
            if (!product || product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Product ${item.productId} is out of stock`);
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
        await order.save();
        const user = await this.userModel.findById(userId);
        if (user && user.email) {
            this.sendInvoice(user.email, order._id.toString(), invoiceProducts, totalAmount).catch(console.error);
        }
        return order;
    }
    async updateOrder(id, data) {
        const order = await this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async sendInvoice(email, orderId, items, total) {
        let text = `Your Order ${orderId} has been placed successfully!\n\n`;
        items.forEach(i => text += `${i.title} x${i.quantity} - $${i.price * i.quantity}\n`);
        text += `\nTotal: $${total}`;
        await this.transporter.sendMail({
            from: '"Ecommerce App" <no-reply@ecommerce.com>',
            to: email,
            subject: 'Purchase Invoice - Order ' + orderId,
            text,
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], OrdersService);
//# sourceMappingURL=orders.service.js.map