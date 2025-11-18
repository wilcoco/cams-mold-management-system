module.exports = (sequelize, DataTypes) => {
  const RegularInspection = sequelize.define('RegularInspection', {
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
    inspection_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '점검일'
    },
    inspection_type: {
      type: DataTypes.ENUM('regular', 'fitting', 'cleaning'),
      allowNull: false,
      comment: '점검 유형'
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
    overall_status: {
      type: DataTypes.ENUM('good', 'fair', 'poor', 'critical'),
      comment: '전체 상태'
    },
    next_inspection_due: {
      type: DataTypes.DATE,
      comment: '다음 점검 예정일'
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
    tableName: 'regular_inspections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['mold_id'] },
      { fields: ['inspector_id'] },
      { fields: ['inspection_date'] },
      { fields: ['inspection_type'] },
      { fields: ['status'] }
    ]
  });

  return RegularInspection;
};
