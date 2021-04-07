const router = require('express').Router();

router.get('/status', (req, res) => {
    res.json({
        statusCode: 200,
        message: 'Server is up and running',
        'X_CSRF_TOKEN': req.cookies['_csrf'],
        'X_XSRF_TOKEN': res.locals.csrfToken
    });
})

module.exports = router;