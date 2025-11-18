require('dotenv').config();
const bcrypt = require('bcrypt');
const {
  User,
  Plant,
  Partner,
  Manufacturer,
  Mold
} = require('../models');

/**
 * 시드 데이터 생성 스크립트
 */
const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. 공장 생성
    console.log('Creating plants...');
    const plants = await Plant.bulkCreate([
      {
        plant_code: 'HQ-001',
        plant_name: '본사',
        location: '서울특별시 강남구',
        contact_person: '김본사',
        phone: '02-1234-5678',
        is_active: true
      },
      {
        plant_code: 'PT-001',
        plant_name: '평택공장',
        location: '경기도 평택시',
        contact_person: '이평택',
        phone: '031-1234-5678',
        is_active: true
      },
      {
        plant_code: 'AS-001',
        plant_name: '아산공장',
        location: '충청남도 아산시',
        contact_person: '박아산',
        phone: '041-1234-5678',
        is_active: true
      }
    ]);
    console.log(`✅ Created ${plants.length} plants`);

    // 2. 협력사 생성
    console.log('Creating partners...');
    const partners = await Partner.bulkCreate([
      {
        partner_code: 'PTN-001',
        partner_name: 'A협력사',
        business_number: '123-45-67890',
        representative: '최협력',
        address: '경기도 화성시',
        phone: '031-2345-6789',
        email: 'partner_a@example.com',
        is_active: true
      },
      {
        partner_code: 'PTN-002',
        partner_name: 'B협력사',
        business_number: '234-56-78901',
        representative: '정협력',
        address: '경기도 용인시',
        phone: '031-3456-7890',
        email: 'partner_b@example.com',
        is_active: true
      }
    ]);
    console.log(`✅ Created ${partners.length} partners`);

    // 3. 제조사 생성
    console.log('Creating manufacturers...');
    const manufacturers = await Manufacturer.bulkCreate([
      {
        manufacturer_code: 'MFG-001',
        manufacturer_name: '대한금형',
        country: '대한민국',
        contact_person: '김제조',
        phone: '02-3456-7890',
        email: 'daehan@example.com',
        is_active: true
      },
      {
        manufacturer_code: 'MFG-002',
        manufacturer_name: '글로벌몰드',
        country: '대한민국',
        contact_person: '이제조',
        phone: '02-4567-8901',
        email: 'global@example.com',
        is_active: true
      }
    ]);
    console.log(`✅ Created ${manufacturers.length} manufacturers`);

    // 4. 사용자 생성
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: hashedPassword,
        name: '시스템관리자',
        email: 'admin@cams.com',
        phone: '010-1234-5678',
        role: 'hq_admin',
        plant_id: plants[0].id,
        is_active: true
      },
      {
        username: 'hq_manager',
        password: hashedPassword,
        name: '본사담당자',
        email: 'manager@cams.com',
        phone: '010-2345-6789',
        role: 'hq_manager',
        plant_id: plants[0].id,
        is_active: true
      },
      {
        username: 'partner_admin',
        password: hashedPassword,
        name: 'A협력사관리자',
        email: 'admin@partner-a.com',
        phone: '010-3456-7890',
        role: 'partner_admin',
        partner_id: partners[0].id,
        is_active: true
      },
      {
        username: 'worker1',
        password: hashedPassword,
        name: '작업자1',
        email: 'worker1@partner-a.com',
        phone: '010-4567-8901',
        role: 'worker',
        partner_id: partners[0].id,
        is_active: true
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 5. 금형 생성
    console.log('Creating molds...');
    const molds = await Mold.bulkCreate([
      {
        mold_code: 'MD-2024-001',
        mold_name: '도어패널 금형',
        mold_type: 'injection',
        status: 'in_use',
        current_location_id: plants[1].id,
        partner_id: partners[0].id,
        manufacturer_id: manufacturers[0].id,
        manufacturing_date: new Date('2024-01-15'),
        weight: 2500.5,
        dimensions: '2000x1500x800',
        cavity_count: 4,
        material: 'NAK80',
        created_by: users[0].id,
        is_active: true
      },
      {
        mold_code: 'MD-2024-002',
        mold_name: '범퍼 금형',
        mold_type: 'injection',
        status: 'maintenance',
        current_location_id: plants[0].id,
        partner_id: partners[0].id,
        manufacturer_id: manufacturers[1].id,
        manufacturing_date: new Date('2024-02-20'),
        weight: 3200.0,
        dimensions: '2500x1800x900',
        cavity_count: 2,
        material: 'SKD61',
        created_by: users[0].id,
        is_active: true
      },
      {
        mold_code: 'MD-2024-003',
        mold_name: '사이드미러 금형',
        mold_type: 'injection',
        status: 'in_use',
        current_location_id: plants[2].id,
        partner_id: partners[1].id,
        manufacturer_id: manufacturers[0].id,
        manufacturing_date: new Date('2024-03-10'),
        weight: 1800.0,
        dimensions: '1500x1200x600',
        cavity_count: 8,
        material: 'NAK80',
        created_by: users[1].id,
        is_active: true
      }
    ]);
    console.log(`✅ Created ${molds.length} molds`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Test credentials:');
    console.log('  Admin:    username: admin          password: password123');
    console.log('  Manager:  username: hq_manager     password: password123');
    console.log('  Partner:  username: partner_admin  password: password123');
    console.log('  Worker:   username: worker1        password: password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seed();
