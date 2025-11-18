const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { authenticate, authorize } = require('../middleware/auth');

// ==================== 일일 점검 ====================

/**
 * @route   POST /api/inspections/daily
 * @desc    일일 점검 생성
 * @access  Private
 */
router.post('/daily', authenticate, inspectionController.createDailyCheck);

/**
 * @route   GET /api/inspections/daily
 * @desc    일일 점검 목록 조회
 * @access  Private
 */
router.get('/daily', authenticate, inspectionController.getDailyChecks);

/**
 * @route   GET /api/inspections/daily/:id
 * @desc    일일 점검 상세 조회
 * @access  Private
 */
router.get('/daily/:id', authenticate, inspectionController.getDailyCheck);

/**
 * @route   PUT /api/inspections/daily/:id
 * @desc    일일 점검 수정
 * @access  Private
 */
router.put('/daily/:id', authenticate, inspectionController.updateDailyCheck);

// ==================== 정기 점검 ====================

/**
 * @route   POST /api/inspections/regular
 * @desc    정기 점검 생성
 * @access  Private
 */
router.post('/regular', authenticate, inspectionController.createRegularInspection);

/**
 * @route   GET /api/inspections/regular
 * @desc    정기 점검 목록 조회
 * @access  Private
 */
router.get('/regular', authenticate, inspectionController.getRegularInspections);

/**
 * @route   GET /api/inspections/regular/:id
 * @desc    정기 점검 상세 조회
 * @access  Private
 */
router.get('/regular/:id', authenticate, inspectionController.getRegularInspection);

/**
 * @route   PUT /api/inspections/regular/:id
 * @desc    정기 점검 수정
 * @access  Private
 */
router.put('/regular/:id', authenticate, inspectionController.updateRegularInspection);

// ==================== 통계 ====================

/**
 * @route   GET /api/inspections/stats
 * @desc    점검 통계
 * @access  Private
 */
router.get('/stats', authenticate, inspectionController.getInspectionStats);

module.exports = router;
