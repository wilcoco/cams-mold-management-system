require('dotenv').config();
const { syncDatabase } = require('../models');

/**
 * 데이터베이스 동기화 스크립트
 * 모든 테이블을 생성합니다.
 */
const sync = async () => {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // force: true - 기존 테이블 삭제 후 재생성 (개발 환경에서만 사용)
    // alter: true - 테이블 구조 변경 (프로덕션에서 사용)
    const options = {
      force: process.env.NODE_ENV !== 'production', // 프로덕션이 아니면 force
      alter: process.env.NODE_ENV === 'production'  // 프로덕션이면 alter
    };

    await syncDatabase(options);

    console.log('✅ Database synchronized successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - users');
    console.log('  - plants');
    console.log('  - partners');
    console.log('  - manufacturers');
    console.log('  - molds');
    console.log('  - qr_sessions');
    console.log('  - daily_checks');
    console.log('  - regular_inspections');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    process.exit(1);
  }
};

sync();
