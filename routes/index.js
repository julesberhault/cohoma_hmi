const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('dashboard', {});
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});
router.get('/general', (req, res) => {
    res.render('general', { title: 'General' });
});
router.get('/satellite1', (req, res) => {
    res.render('satellite1', { title: 'Satellite1' });
});
router.get('/satellite2', (req, res) => {
    res.render('satellite2', { title: 'Satellite2' });
});
router.get('/satellite3', (req, res) => {
    res.render('satellite3', { title: 'Satellite3' });
});
router.get('/satellite4', (req, res) => {
    res.render('satellite4', { title: 'Satellite4' });
});

module.exports = router;