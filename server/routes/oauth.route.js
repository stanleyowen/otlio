const router = require('express').Router();
const axios = require('axios');

const CLIENT_ID = process.env.GITHUB_ID;
const CLIENT_SECRET = process.env.GITHUB_SECRET;

router.get('/github', async (req, res) => {
    const code = req.query.code;
    await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`,
        headers: { accept: 'application/json' }
    })
    .then(async result => {
        const token = result.data.access_token;
        if(token){
            await axios({
                method: 'get',
                url: `https://api.github.com/user`,
                headers: {
                    Authorization: 'token ' + token
                }
            })
            .then(user => { res.json(user.data) })
            .catch(err => console.log(err))
        }else res.json('Error in Registering via GitHub');
    })
    .catch(err => console.log(err))
})

module.exports = router;