const express = require('express');
const router = express.Router();
const NoticeController = require('../../domain/notice/controller/NoticeController');

// 공지사항 목록
router.get('/', NoticeController.getNoticeList);

module.exports = router; 