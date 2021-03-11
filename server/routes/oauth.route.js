const router = require('express').Router();
const axios = require('axios');
let User = require('../models/users.model');

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
                headers: { Authorization: 'token ' + token }
            })
            .then(user => {
                const email = user.data.email;
                const dataModel = new User ({
                    email,
                    password: null,
                    thirdParty: {
                        isThirdParty: true,
                        provider: 'github',
                        status: 'Pending'
                    }
                });
                console.log(dataModel)
                dataModel.save()
                .then(() => res.redirect(`http://localhost:3000/register/oauth?service=github&email=${email}`))
                .catch(() => res.json('Error in Registering Due to Duplicate Email Address'))
            })
            .catch(err => console.log(err))
        }else res.json(result.data);
    })
    .catch(err => console.log(err))
})

module.exports = router;