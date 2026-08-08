import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../modules/users/entities/user.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { CustomerFollowUp } from '../modules/customers/entities/customer-followup.entity';
import { Product } from '../modules/products/entities/product.entity';
import { StockMovement } from '../modules/products/entities/stock-movement.entity';
import { SalesChallan } from '../modules/challans/entities/sales-challan.entity';
import { ChallanItem } from '../modules/challans/entities/challan-item.entity';

async function seed() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: './data/erp.sqlite',
    entities: [User, Customer, CustomerFollowUp, Product, StockMovement, SalesChallan, ChallanItem],
    synchronize: true,
  });

  await AppDataSource.initialize();
  console.log('Database connected.');

  // Seed Users
  const users = [
    { name: 'Admin User', email: 'admin@erp.com', password: 'Admin@123', role: 'Admin' },
    { name: 'Sales Rep', email: 'sales@erp.com', password: 'Sales@123', role: 'Sales' },
    { name: 'Warehouse Mgr', email: 'warehouse@erp.com', password: 'Warehouse@123', role: 'Warehouse' },
    { name: 'Accounts Dept', email: 'accounts@erp.com', password: 'Accounts@123', role: 'Accounts' }
  ];

  const savedUsers = {};
  for (const u of users) {
    let user = await AppDataSource.getRepository(User).findOneBy({ email: u.email });
    if (!user) {
      user = new User();
      user.name = u.name;
      user.email = u.email;
      user.password = u.password;
      user.role = u.role;
      user.isActive = true;
      user = await AppDataSource.getRepository(User).save(user);
    }
    savedUsers[u.role] = user;
  }
  console.log('Users seeded.');

  const admin = savedUsers['Admin'];
  const sales = savedUsers['Sales'];
  const warehouse = savedUsers['Warehouse'];

  // Seed Customers
  const customerRepo = AppDataSource.getRepository(Customer);
  if (await customerRepo.count() === 0) {
    const customers = [];
    for (let i = 1; i <= 10; i++) {
      const c = new Customer();
      c.name = `Customer ${i}`;
      c.mobile = `987654321${i % 10}`;
      c.email = `customer${i}@example.com`;
      c.businessName = `Business ${i} Ltd`;
      c.gstNumber = `27AAAAA000${i}A1ZA`;
      c.customerType = i % 3 === 0 ? 'Distributor' : (i % 2 === 0 ? 'Wholesale' : 'Retail');
      c.address = `${i} Main St, City`;
      c.status = i % 2 === 0 ? 'Active' : 'Lead';
      c.creator = admin;
      customers.push(c);
    }
    await customerRepo.save(customers);
    console.log('Customers seeded.');
  }

  // Seed Products
  const productRepo = AppDataSource.getRepository(Product);
  const stockMoveRepo = AppDataSource.getRepository(StockMovement);
  if (await productRepo.count() === 0) {
    const products = [];
    for (let i = 1; i <= 15; i++) {
      const p = new Product();
      p.name = `Product ${i}`;
      p.sku = `PROD-${i.toString().padStart(4, '0')}`;
      p.category = `Category ${i % 3 + 1}`;
      p.unitPrice = 100 + (i * 10);
      p.currentStock = 50 + (i * 5);
      p.minStockAlert = 20;
      p.warehouseLocation = `Aisle ${i % 5 + 1}`;
      p.creator = admin;
      products.push(p);
    }
    await productRepo.save(products);

    for (const p of products) {
      const m = new StockMovement();
      m.product = p;
      m.quantity = p.currentStock;
      m.movementType = 'IN';
      m.reason = 'Initial Stock';
      m.creator = warehouse;
      await stockMoveRepo.save(m);
    }
    console.log('Products and stock movements seeded.');
  }

  // Seed Challans
  const challanRepo = AppDataSource.getRepository(SalesChallan);
  const challanItemRepo = AppDataSource.getRepository(ChallanItem);
  if (await challanRepo.count() === 0) {
    const customers = await customerRepo.find();
    const products = await productRepo.find();

    for (let i = 1; i <= 3; i++) {
      const c = new SalesChallan();
      const date = new Date();
      c.challanNumber = `CH-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${1000 + i}`;
      c.customer = customers[i];
      c.status = i === 1 ? 'Confirmed' : 'Draft';
      c.creator = sales;
      
      let tq = 0;
      let ta = 0;
      
      const p1 = products[i];
      const p2 = products[i + 1];

      c.items = []; // required by OneToMany relation saving

      await challanRepo.save(c);

      const ci1 = new ChallanItem();
      ci1.challan = c;
      ci1.product = p1;
      ci1.productNameSnapshot = p1.name;
      ci1.productSkuSnapshot = p1.sku;
      ci1.productPriceSnapshot = p1.unitPrice;
      ci1.quantity = 2;
      ci1.lineTotal = 2 * p1.unitPrice;
      await challanItemRepo.save(ci1);
      
      const ci2 = new ChallanItem();
      ci2.challan = c;
      ci2.product = p2;
      ci2.productNameSnapshot = p2.name;
      ci2.productSkuSnapshot = p2.sku;
      ci2.productPriceSnapshot = p2.unitPrice;
      ci2.quantity = 3;
      ci2.lineTotal = 3 * p2.unitPrice;
      await challanItemRepo.save(ci2);

      tq = 5;
      ta = ci1.lineTotal + ci2.lineTotal;
      c.totalQuantity = tq;
      c.totalAmount = ta;
      
      if (c.status === 'Confirmed') {
        p1.currentStock -= 2;
        p2.currentStock -= 3;
        await productRepo.save([p1, p2]);

        const m1 = new StockMovement();
        m1.product = p1;
        m1.quantity = 2;
        m1.movementType = 'OUT';
        m1.reason = `Sales Challan: ${c.challanNumber}`;
        m1.creator = sales;
        
        const m2 = new StockMovement();
        m2.product = p2;
        m2.quantity = 3;
        m2.movementType = 'OUT';
        m2.reason = `Sales Challan: ${c.challanNumber}`;
        m2.creator = sales;
        await stockMoveRepo.save([m1, m2]);
      }

      await challanRepo.save(c);
    }
    console.log('Challans seeded.');
  }

  await AppDataSource.destroy();
  console.log('Seed completed successfully.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
