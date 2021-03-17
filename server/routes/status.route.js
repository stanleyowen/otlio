const router = require('express').Router();

router.get('/status', (req, res, next) => {
    res.json({
        message: 'Server is up and running',
        'X_CSRF_TOKEN': req.cookies['_csrf'],
        'X_XSRF_TOKEN': res.locals.csrfToken,
    });
})

module.exports = router;