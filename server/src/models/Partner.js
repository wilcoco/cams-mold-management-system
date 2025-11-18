module.exports = (sequelize, DataTypes) => {
  const Partner = sequelize.define('Partner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '협력사명'
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: '협력사 코드'
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
    contract_start_date: {
      type: DataTypes.DATE,
      comment: '계약 시작일'
    },
    contract_end_date: {
      type: DataTypes.DATE,
      comment: '계약 종료일'
    },
    grade: {
      type: DataTypes.ENUM('A+', 'A', 'B', 'C', 'D'),
      comment: '평가 등급'
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
    tableName: 'partners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Partner;
};
