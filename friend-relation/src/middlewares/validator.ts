import { Request, Response, NextFunction } from 'express';

// val
const validate = (schema: any, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[source]);
    
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        isError: true
      });
    }
    
    next();
  };
};

export default validate;
