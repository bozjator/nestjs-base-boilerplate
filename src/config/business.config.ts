import { registerAs } from '@nestjs/config';

export default registerAs('app_business', () => ({
  businessConfigExample: process.env.API_BUSINESS_CONFIG_EXAMPLE,
}));
