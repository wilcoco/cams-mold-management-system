const { QRSession, Mold, User, Plant } = require('../models');
const { Op } = require('sequelize');

/**
 * QR 코드 스캔 (세션 시작)
 */
const scanQR = async (req, res, next) => {
  try {
    const { mold_id, latitude, longitude, accuracy } = req.body;

    // 필수 필드 검증
    if (!mold_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mold ID is required'
        }
      });
    }

    // 금형 확인
    const mold = await Mold.findOne({
      where: { id: mold_id, is_active: true },
      include: [
        { model: Plant, as: 'currentLocation' },
        { model: User, as: 'creator' }
      ]
    });

    if (!mold) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MOLD_NOT_FOUND',
          message: 'Mold not found'
        }
      });
    }

    // GPS 정확도 검증
    const gpsThreshold = parseInt(process.env.GPS_ACCURACY_THRESHOLD) || 50;
    const isGpsValid = accuracy && accuracy <= gpsThreshold;

    // QR 세션 생성
    const session = await QRSession.create({
      mold_id,
      user_id: req.user.id,
      scan_latitude: latitude,
      scan_longitude: longitude,
      gps_accuracy: accuracy,
      is_gps_valid: isGpsValid,
      session_status: 'active'
    });

    // 생성된 세션 조회 (관계 포함)
    const createdSession = await QRSession.findByPk(session.id, {
      include: [
        {
          model: Mold,
          as: 'mold',
          include: [
            { model: Plant, as: 'currentLocation' }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: {
        session: createdSession,
        mold: mold,
        gps_valid: isGpsValid,
        message: isGpsValid 
          ? 'QR scan successful' 
          : 'QR scan successful but GPS accuracy is low'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR 세션 종료
 */
const endSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await QRSession.findOne({
      where: { 
        id,
        user_id: req.user.id,
        session_status: 'active'
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Active session not found'
        }
      });
    }

    // 세션 종료
    await session.update({
      session_status: 'completed',
      notes: notes || session.notes
    });

    const updatedSession = await QRSession.findByPk(id, {
      include: [
        { model: Mold, as: 'mold' },
        { model: User, as: 'user', attributes: ['id', 'username', 'name'] }
      ]
    });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR 세션 목록 조회
 */
const getSessions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      mold_id,
      user_id,
      status,
      start_date,
      end_date,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // 검색 조건 구성
    const where = {};

    if (mold_id) {
      where.mold_id = mold_id;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (status) {
      where.session_status = status;
    }

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.created_at[Op.lte] = new Date(end_date);
      }
    }

    // 역할별 필터링
    if (req.user.role === 'worker') {
      where.user_id = req.user.id;
    }

    // 페이징 계산
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 조회
    const { count, rows } = await QRSession.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sort_by, sort_order]],
      include: [
        {
          model: Mold,
          as: 'mold',
          attributes: ['id', 'mold_code', 'mold_name', 'status'],
          include: [
            {
              model: Plant,
              as: 'currentLocation',
              attributes: ['id', 'plant_code', 'plant_name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        sessions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR 세션 상세 조회
 */
const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await QRSession.findByPk(id, {
      include: [
        {
          model: Mold,
          as: 'mold',
          include: [
            { model: Plant, as: 'currentLocation' }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'email', 'role']
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }

    // 권한 확인 (작업자는 자신의 세션만 조회 가능)
    if (req.user.role === 'worker' && session.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this session'
        }
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 활성 세션 조회 (현재 사용자)
 */
const getActiveSession = async (req, res, next) => {
  try {
    const session = await QRSession.findOne({
      where: {
        user_id: req.user.id,
        session_status: 'active'
      },
      include: [
        {
          model: Mold,
          as: 'mold',
          include: [
            { model: Plant, as: 'currentLocation' }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (!session) {
      return res.json({
        success: true,
        data: null,
        message: 'No active session found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 금형별 QR 스캔 이력
 */
const getMoldScanHistory = async (req, res, next) => {
  try {
    const { mold_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 금형 확인
    const mold = await Mold.findOne({
      where: { id: mold_id, is_active: true }
    });

    if (!mold) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MOLD_NOT_FOUND',
          message: 'Mold not found'
        }
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await QRSession.findAndCountAll({
      where: { mold_id },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        mold: {
          id: mold.id,
          mold_code: mold.mold_code,
          mold_name: mold.mold_name
        },
        sessions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR 스캔 통계
 */
const getQRStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.created_at[Op.lte] = new Date(end_date);
      }
    }

    // 역할별 필터링
    if (req.user.role === 'worker') {
      where.user_id = req.user.id;
    }

    // 전체 스캔 수
    const totalScans = await QRSession.count({ where });

    // 상태별 통계
    const byStatus = await QRSession.findAll({
      where,
      attributes: [
        'session_status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['session_status'],
      raw: true
    });

    // GPS 유효성 통계
    const gpsStats = await QRSession.findAll({
      where,
      attributes: [
        'is_gps_valid',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['is_gps_valid'],
      raw: true
    });

    // 사용자별 통계 (상위 10명)
    const byUser = await QRSession.findAll({
      where,
      attributes: [
        'user_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('QRSession.id')), 'count']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'name']
      }],
      group: ['user_id', 'user.id', 'user.username', 'user.name'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('QRSession.id')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_scans: totalScans,
        by_status: byStatus,
        gps_stats: gpsStats,
        top_users: byUser
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanQR,
  endSession,
  getSessions,
  getSession,
  getActiveSession,
  getMoldScanHistory,
  getQRStats
};
