module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: '사용자 아이디'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '암호화된 비밀번호'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '사용자 이름'
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      comment: '이메일'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '전화번호'
    },
    role: {
      type: DataTypes.ENUM('admin', 'hq_staff', 'partner', 'manufacturer', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
      comment: '사용자 역할'
    },
    partner_id: {
      type: DataTypes.INTEGER,
      comment: '소속 협력사 ID'
    },
    manufacturer_id: {
      type: DataTypes.INTEGER,
      comment: '소속 제작처 ID'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '활성 상태'
    },
    last_login: {
      type: DataTypes.DATE,
      comment: '마지막 로그인 시간'
    },
    refresh_token: {
      type: DataTypes.TEXT,
      comment: 'JWT Refresh Token'
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['username'] },
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['partner_id'] },
      { fields: ['manufacturer_id'] }
    ]
  });

  return User;
};
