const Joi = require('joi');

module.exports.productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid('vegetables', 'fruits', 'grains', 'dairy', 'other').required(),
  pricePerUnit: Joi.number().min(0).required(),
  unit: Joi.string().valid('kg', 'g', 'piece', 'litre').required(),
  quantity: Joi.number().min(0).required(),
  harvestDate: Joi.date().iso().required(),
  organic: Joi.boolean().default(false)
});