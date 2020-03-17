const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('telemetry', { title: 'Telemetry' });
});

router.post('/',
    [
        check('name')
            .isLength({ min: 1 })
            .withMessage('Please enter a name'),
        check('email')
            .isLength({ min: 1 })
            .withMessage('Please enter an email'),
    ],
    (req, res) => {
        const errors = validationResult(req);
    
        if (errors.isEmpty()) {
          res.send('Thank you for your registration!');
        } else {
          res.render('form', {
            title: 'Registration form',
            errors: errors.array(),
            data: req.body,
          });
        }
      }
    );

router.get('/attitude', (req, res) => {
    Attitude.find()
      .then((attitude) => {
        res.send(attitude);
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });
  });

module.exports = router;