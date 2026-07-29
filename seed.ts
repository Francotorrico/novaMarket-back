// import { faker } from '@faker-js/faker';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Product from './src/models/Product';

// dotenv.config();

// const categories = ['accesorios', 'periféricos', 'gadgets'] as const;

// const seedProducts = async () => {
//   await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novamarket');

//   await Product.deleteMany({});
//   console.log('🗑️  Productos eliminados');

//   const products = Array.from({ length: 10 }, () => ({
//     name: faker.commerce.productName(),
//     description: faker.commerce.productDescription(),
//     price: Number(faker.commerce.price()),
//     category: faker.helpers.arrayElement(categories),
//     imageUrl: faker.image.url(),
//     stock: faker.number.int({ min: 0, max: 100 }),
//     active: true
//   }));

//   await Product.insertMany(products);
//   console.log('✅ 10 productos creados con Faker');

//   await mongoose.disconnect();
//   process.exit();
// };

// seedProducts();
