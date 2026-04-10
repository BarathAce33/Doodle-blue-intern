import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(data: any) {
    // create
    const product = new this.productModel(data);
    await product.save();
    return product;
  }

  async findAll() {
    // all
    return this.productModel.find().exec();
  }

  async findOne(id: string) {
    // one
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, data: any) {
    // update
    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    // delete
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { success: true };
  }

  async addToWishlist(productId: string, userId: string) {
    // search
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // user
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    // wishlist
    if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save();
    }
    
    return { success: true, message: 'Product added to wishlist' };
  }
}
