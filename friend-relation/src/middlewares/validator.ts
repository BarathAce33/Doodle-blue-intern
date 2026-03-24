import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

// val
const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

export default validate;
