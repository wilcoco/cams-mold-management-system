module.exports = (sequelize, DataTypes) => {
  const Manufacturer = sequelize.define('Manufacturer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '제작처명'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '제작처 코드'
    },
    business_number: {
      type: DataTypes.STRING(20),
      comment: '사업자번호'
    },
    representative: {
      type: DataTypes.STRING(100),
      comment: '대표자'
    },
    address: {
      type: DataTypes.STRING(500),
      comment: '주소'
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      comment: '연락처'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '이메일'
    },
    specialization: {
      type: DataTypes.STRING(200),
      comment: '전문 분야'
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
    tableName: 'manufacturers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Manufacturer;
};
