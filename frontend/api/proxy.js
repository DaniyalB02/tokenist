const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const apiUrl = 'http://ec2-3-93-45-20.compute-1.amazonaws.com:8000/api/process_data/';

    const response = await fetch(apiUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method === 'POST' ? req.body : null
    });

    const data = await response.text();

    res.status(response.status).send(data);
}
