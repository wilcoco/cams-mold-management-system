const { DailyCheck, RegularInspection, Mold, User } = require('../models');
const { Op } = require('sequelize');

// ==================== 일일 점검 ====================

/**
 * 일일 점검 생성
 */
const createDailyCheck = async (req, res, next) => {
  try {
    const {
      mold_id,
      check_items,
      overall_status,
      notes,
      images
    } = req.body;

    // 필수 필드 검증
    if (!mold_id || !check_items) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mold ID and check items are required'
        }
      });
    }

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

    // 일일 점검 생성
    const dailyCheck = await DailyCheck.create({
      mold_id,
      inspector_id: req.user.id,
      check_items,
      overall_status: overall_status || 'normal',
      notes,
      images: images || []
    });

    // 생성된 점검 조회
    const createdCheck = await DailyCheck.findByPk(dailyCheck.id, {
      include: [
        {
          model: Mold,
          as: 'mold',
          attributes: ['id', 'mold_code', 'mold_name', 'status']
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdCheck
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 일일 점검 목록 조회
 */
const getDailyChecks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      mold_id,
      inspector_id,
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

    if (inspector_id) {
      where.inspector_id = inspector_id;
    }

    if (status) {
      where.overall_status = status;
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
      where.inspector_id = req.user.id;
    }

    // 페이징 계산
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 조회
    const { count, rows } = await DailyCheck.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sort_by, sort_order]],
      include: [
        {
          model: Mold,
          as: 'mold',
          attributes: ['id', 'mold_code', 'mold_name', 'status']
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        daily_checks: rows,
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
 * 일일 점검 상세 조회
 */
const getDailyCheck = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dailyCheck = await DailyCheck.findByPk(id, {
      include: [
        {
          model: Mold,
          as: 'mold'
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name', 'email', 'role']
        }
      ]
    });

    if (!dailyCheck) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DAILY_CHECK_NOT_FOUND',
          message: 'Daily check not found'
        }
      });
    }

    res.json({
      success: true,
      data: dailyCheck
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 일일 점검 수정
 */
const updateDailyCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const dailyCheck = await DailyCheck.findByPk(id);

    if (!dailyCheck) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DAILY_CHECK_NOT_FOUND',
          message: 'Daily check not found'
        }
      });
    }

    // 권한 확인 (본인 또는 관리자만 수정 가능)
    if (req.user.role === 'worker' && dailyCheck.inspector_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own daily checks'
        }
      });
    }

    // 업데이트
    await dailyCheck.update(updateData);

    const updatedCheck = await DailyCheck.findByPk(id, {
      include: [
        { model: Mold, as: 'mold' },
        { model: User, as: 'inspector' }
      ]
    });

    res.json({
      success: true,
      data: updatedCheck
    });
  } catch (error) {
    next(error);
  }
};

// ==================== 정기 점검 ====================

/**
 * 정기 점검 생성
 */
const createRegularInspection = async (req, res, next) => {
  try {
    const {
      mold_id,
      inspection_type,
      inspection_items,
      overall_result,
      notes,
      images,
      next_inspection_date
    } = req.body;

    // 필수 필드 검증
    if (!mold_id || !inspection_type || !inspection_items) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mold ID, inspection type, and inspection items are required'
        }
      });
    }

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

    // 정기 점검 생성
    const inspection = await RegularInspection.create({
      mold_id,
      inspector_id: req.user.id,
      inspection_type,
      inspection_items,
      overall_result: overall_result || 'pass',
      notes,
      images: images || [],
      next_inspection_date
    });

    // 생성된 점검 조회
    const createdInspection = await RegularInspection.findByPk(inspection.id, {
      include: [
        {
          model: Mold,
          as: 'mold',
          attributes: ['id', 'mold_code', 'mold_name', 'status']
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdInspection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 정기 점검 목록 조회
 */
const getRegularInspections = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      mold_id,
      inspector_id,
      inspection_type,
      result,
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

    if (inspector_id) {
      where.inspector_id = inspector_id;
    }

    if (inspection_type) {
      where.inspection_type = inspection_type;
    }

    if (result) {
      where.overall_result = result;
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

    // 페이징 계산
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 조회
    const { count, rows } = await RegularInspection.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sort_by, sort_order]],
      include: [
        {
          model: Mold,
          as: 'mold',
          attributes: ['id', 'mold_code', 'mold_name', 'status']
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        regular_inspections: rows,
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
 * 정기 점검 상세 조회
 */
const getRegularInspection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inspection = await RegularInspection.findByPk(id, {
      include: [
        {
          model: Mold,
          as: 'mold'
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'name', 'email', 'role']
        }
      ]
    });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSPECTION_NOT_FOUND',
          message: 'Regular inspection not found'
        }
      });
    }

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 정기 점검 수정
 */
const updateRegularInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inspection = await RegularInspection.findByPk(id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSPECTION_NOT_FOUND',
          message: 'Regular inspection not found'
        }
      });
    }

    // 권한 확인
    if (req.user.role === 'worker' && inspection.inspector_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own inspections'
        }
      });
    }

    // 업데이트
    await inspection.update(updateData);

    const updatedInspection = await RegularInspection.findByPk(id, {
      include: [
        { model: Mold, as: 'mold' },
        { model: User, as: 'inspector' }
      ]
    });

    res.json({
      success: true,
      data: updatedInspection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 점검 통계
 */
const getInspectionStats = async (req, res, next) => {
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

    // 일일 점검 통계
    const dailyCheckCount = await DailyCheck.count({ where });
    const dailyCheckByStatus = await DailyCheck.findAll({
      where,
      attributes: [
        'overall_status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['overall_status'],
      raw: true
    });

    // 정기 점검 통계
    const regularInspectionCount = await RegularInspection.count({ where });
    const regularInspectionByType = await RegularInspection.findAll({
      where,
      attributes: [
        'inspection_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['inspection_type'],
      raw: true
    });

    const regularInspectionByResult = await RegularInspection.findAll({
      where,
      attributes: [
        'overall_result',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['overall_result'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        daily_checks: {
          total: dailyCheckCount,
          by_status: dailyCheckByStatus
        },
        regular_inspections: {
          total: regularInspectionCount,
          by_type: regularInspectionByType,
          by_result: regularInspectionByResult
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // 일일 점검
  createDailyCheck,
  getDailyChecks,
  getDailyCheck,
  updateDailyCheck,
  
  // 정기 점검
  createRegularInspection,
  getRegularInspections,
  getRegularInspection,
  updateRegularInspection,
  
  // 통계
  getInspectionStats
};
