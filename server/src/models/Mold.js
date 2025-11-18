module.exports = (sequelize, DataTypes) => {
  const Mold = sequelize.define('Mold', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mold_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: '금형 고유 ID (M-2024-001)'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '금형명'
    },
    part_number: {
      type: DataTypes.STRING(100),
      comment: 'Part Number'
    },
    part_name: {
      type: DataTypes.STRING(200),
      comment: 'Part Name'
    },
    vehicle_model: {
      type: DataTypes.STRING(100),
      comment: '차종'
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'repair', 'standby', 'transfer', 'scrapped'),
      defaultValue: 'active',
      comment: '금형 상태'
    },
    qr_code: {
      type: DataTypes.STRING(100),
      unique: true,
      comment: 'QR 코드'
    },
    current_location_type: {
      type: DataTypes.ENUM('hq', 'partner', 'manufacturer', 'plant'),
      comment: '현재 위치 유형'
    },
    current_location_id: {
      type: DataTypes.INTEGER,
      comment: '현재 위치 ID'
    },
    gps_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      comment: 'GPS 위도'
    },
    gps_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      comment: 'GPS 경도'
    },
    gps_accuracy: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'GPS 정확도 (미터)'
    },
    gps_last_updated: {
      type: DataTypes.DATE,
      comment: 'GPS 마지막 업데이트'
    },
    partner_id: {
      type: DataTypes.INTEGER,
      comment: '협력사 ID'
    },
    manufacturer_id: {
      type: DataTypes.INTEGER,
      comment: '제작처 ID'
    },
    production_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '누적 생산수량'
    },
    last_daily_check: {
      type: DataTypes.DATE,
      comment: '마지막 일상점검일'
    },
    last_regular_inspection: {
      type: DataTypes.DATE,
      comment: '마지막 정기점검일'
    },
    next_inspection_due: {
      type: DataTypes.DATE,
      comment: '다음 점검 예정일'
    },
    created_by: {
      type: DataTypes.INTEGER,
      comment: '등록자 ID'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'molds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['mold_id'] },
      { fields: ['qr_code'] },
      { fields: ['status'] },
      { fields: ['current_location_type', 'current_location_id'] },
      { fields: ['partner_id'] },
      { fields: ['manufacturer_id'] }
    ]
  });

  return Mold;
};
