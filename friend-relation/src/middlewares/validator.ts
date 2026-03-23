// validator
const validate = (schema: any) => {
  return (req: any, res: any, next: any) => {
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

module.exports = validate;

export {};
