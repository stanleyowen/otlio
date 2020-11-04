const router = require('express').Router();
let Exercise = require('../models/todo.models');

router.route('/').get((req,res) => {
    Exercise.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json('Error :'+err));
})

router.route('/add').post((req,res) => {
    const username = req.body.username;
    const description = req.body.description;
    const date = Date.parse(req.body.date);
    if(!username) {
        return res.status('401').json('Unauthorized');
    }
    const newExercise = new Exercise({
        username: username,
        description: description,
        date: date,
    })
    newExercise.save()
    .then(res.json('Exercise Added!'))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/:id').delete((req,res) => {
    Exercise.findByIdAndDelete(req.params.id)
    .then(res.json('Exercises Deleted!'))
    .catch(err => res.status(400).json('Error: '+err));
})
module.exports = router;