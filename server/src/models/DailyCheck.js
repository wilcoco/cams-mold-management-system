module.exports = (sequelize, DataTypes) => {
  const DailyCheck = sequelize.define('DailyCheck', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mold_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '금형 ID'
    },
    inspector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '점검자 ID'
    },
    check_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '점검일'
    },
    production_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '생산수량'
    },
    check_items: {
      type: DataTypes.JSONB,
      comment: '점검 항목 (JSON)'
    },
    findings: {
      type: DataTypes.TEXT,
      comment: '발견사항'
    },
    actions_taken: {
      type: DataTypes.TEXT,
      comment: '조치사항'
    },
    images: {
      type: DataTypes.JSONB,
      comment: '첨부 이미지 (JSON array)'
    },
    gps_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      comment: '점검 위치 위도'
    },
    gps_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      comment: '점검 위치 경도'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      comment: '승인 상태'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      comment: '승인자 ID'
    },
    approved_at: {
      type: DataTypes.DATE,
      comment: '승인일시'
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
    tableName: 'daily_checks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['mold_id'] },
      { fields: ['inspector_id'] },
      { fields: ['check_date'] },
      { fields: ['status'] }
    ]
  });

  return DailyCheck;
};
