const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// 모델 임포트
const User = require('./User')(sequelize, DataTypes);
const Mold = require('./Mold')(sequelize, DataTypes);
const QRSession = require('./QRSession')(sequelize, DataTypes);
const Plant = require('./Plant')(sequelize, DataTypes);
const Partner = require('./Partner')(sequelize, DataTypes);
const Manufacturer = require('./Manufacturer')(sequelize, DataTypes);
const DailyCheck = require('./DailyCheck')(sequelize, DataTypes);
const RegularInspection = require('./RegularInspection')(sequelize, DataTypes);

// 관계 설정
const setupAssociations = () => {
  // User 관계
  User.hasMany(Mold, { foreignKey: 'created_by', as: 'createdMolds' });
  User.hasMany(QRSession, { foreignKey: 'user_id', as: 'qrSessions' });
  User.hasMany(DailyCheck, { foreignKey: 'inspector_id', as: 'dailyChecks' });
  
  // Mold 관계
  Mold.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Mold.belongsTo(Plant, { foreignKey: 'current_location_id', as: 'currentLocation' });
  Mold.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
  Mold.belongsTo(Manufacturer, { foreignKey: 'manufacturer_id', as: 'manufacturer' });
  Mold.hasMany(QRSession, { foreignKey: 'mold_id', as: 'qrSessions' });
  Mold.hasMany(DailyCheck, { foreignKey: 'mold_id', as: 'dailyChecks' });
  Mold.hasMany(RegularInspection, { foreignKey: 'mold_id', as: 'regularInspections' });
  
  // QRSession 관계
  QRSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  QRSession.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
  
  // Plant 관계
  Plant.hasMany(Mold, { foreignKey: 'current_location_id', as: 'molds' });
  
  // Partner 관계
  Partner.hasMany(Mold, { foreignKey: 'partner_id', as: 'molds' });
  Partner.hasMany(User, { foreignKey: 'partner_id', as: 'users' });
  
  // Manufacturer 관계
  Manufacturer.hasMany(Mold, { foreignKey: 'manufacturer_id', as: 'molds' });
  
  // DailyCheck 관계
  DailyCheck.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
  DailyCheck.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });
  
  // RegularInspection 관계
  RegularInspection.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
  RegularInspection.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });
};

setupAssociations();

// 데이터베이스 동기화
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Mold,
  QRSession,
  Plant,
  Partner,
  Manufacturer,
  DailyCheck,
  RegularInspection,
  syncDatabase
};
