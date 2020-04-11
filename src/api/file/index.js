const express = require('express');
const controller = require('./file.controller');
const authenticate = require('../../components/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', controller.create);

router.put('/:id', controller.update);
router.put('/:id/share', controller.share);

// router.delete('/:id', controller.remove);

module.exports = router;
