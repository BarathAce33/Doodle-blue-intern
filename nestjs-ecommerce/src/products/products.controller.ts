import { Controller, Get, Post, Body, Param, Put, Delete, Req, UsePipes, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { CreateProductSchema, UpdateProductSchema, WishlistSchema } from './validators/product.validator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateProductSchema))
  async create(@Body() body: any) {
    // create
    return this.productsService.create(body);
  }

  @Get()
  async findAll() {
    // all
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // one
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateProductSchema))
  async update(@Param('id') id: string, @Body() body: any) {
    // update
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    // delete
    return this.productsService.remove(id);
  }

  @Post(':id/wishlist')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(WishlistSchema))
  async addToWishlist(@Param('id') id: string, @Req() req: any) {
    // wishlist
    return this.productsService.addToWishlist(id, req.user.userId);
  }
}
