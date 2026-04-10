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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
const user_schema_1 = require("../users/schemas/user.schema");
let ProductsService = class ProductsService {
    constructor(productModel, userModel) {
        this.productModel = productModel;
        this.userModel = userModel;
    }
    async create(data) {
        const product = new this.productModel(data);
        await product.save();
        return product;
    }
    async findAll() {
        return this.productModel.find().exec();
    }
    async findOne(id) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, data) {
        const product = await this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async remove(id) {
        const product = await this.productModel.findByIdAndDelete(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return { success: true };
    }
    async addToWishlist(productId, userId) {
        const product = await this.productModel.findById(productId);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        return { success: true, message: 'Product added to wishlist' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map