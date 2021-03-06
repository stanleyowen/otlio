const router = require('express').Router();

router.get('/status', (req, res, next) => {
    res.json('Server is up and running');
})

module.exports = router;