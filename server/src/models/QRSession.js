module.exports = (sequelize, DataTypes) => {
  const QRSession = sequelize.define('QRSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    session_token: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      comment: '세션 토큰'
    },
    mold_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '금형 ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '사용자 ID'
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '스캔한 QR 코드'
    },
    scan_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      comment: '스캔 위치 위도'
    },
    scan_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      comment: '스캔 위치 경도'
    },
    scan_accuracy: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'GPS 정확도 (미터)'
    },
    scan_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '스캔 시간'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '세션 만료 시간 (8시간)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '세션 활성 상태'
    },
    ended_at: {
      type: DataTypes.DATE,
      comment: '세션 종료 시간'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'qr_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['session_token'] },
      { fields: ['mold_id'] },
      { fields: ['user_id'] },
      { fields: ['is_active'] },
      { fields: ['scan_time'] }
    ]
  });

  return QRSession;
};
