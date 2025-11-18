module.exports = (sequelize, DataTypes) => {
  const Plant = sequelize.define('Plant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '사업장명'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '사업장 코드'
    },
    type: {
      type: DataTypes.ENUM('hq', 'partner', 'manufacturer'),
      allowNull: false,
      comment: '사업장 유형'
    },
    address: {
      type: DataTypes.STRING(500),
      comment: '주소'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      comment: '위도'
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      comment: '경도'
    },
    contact_person: {
      type: DataTypes.STRING(100),
      comment: '담당자'
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      comment: '연락처'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '활성 상태'
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
    tableName: 'plants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Plant;
};
