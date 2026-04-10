import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // meta
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }

    // validate
    const { error } = this.schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((d) => d.message).join(', ');
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }
    return value;
  }
}
