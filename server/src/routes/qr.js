const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/qr-sessions/scan
 * @desc    QR 코드 스캔 (세션 시작)
 * @access  Private
 */
router.post('/scan', authenticate, qrController.scanQR);

/**
 * @route   GET /api/qr-sessions
 * @desc    QR 세션 목록 조회
 * @access  Private
 */
router.get('/', authenticate, qrController.getSessions);

/**
 * @route   GET /api/qr-sessions/active
 * @desc    현재 사용자의 활성 세션 조회
 * @access  Private
 */
router.get('/active', authenticate, qrController.getActiveSession);

/**
 * @route   GET /api/qr-sessions/stats
 * @desc    QR 스캔 통계
 * @access  Private
 */
router.get('/stats', authenticate, qrController.getQRStats);

/**
 * @route   GET /api/qr-sessions/mold/:mold_id
 * @desc    금형별 QR 스캔 이력
 * @access  Private
 */
router.get('/mold/:mold_id', authenticate, qrController.getMoldScanHistory);

/**
 * @route   GET /api/qr-sessions/:id
 * @desc    QR 세션 상세 조회
 * @access  Private
 */
router.get('/:id', authenticate, qrController.getSession);

/**
 * @route   PATCH /api/qr-sessions/:id/end
 * @desc    QR 세션 종료
 * @access  Private
 */
router.patch('/:id/end', authenticate, qrController.endSession);

module.exports = router;
