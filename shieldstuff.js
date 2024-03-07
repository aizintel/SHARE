/* jshint ignore:start */

var request = require("request");

exports.tokenchecker = function (token) {
        var checktoken = {
                    method: 'GET',
                    url: "https://graph.facebook.com/me?access_token=" + token,
                }
        return new Promise(async (resolve, reject) => {
                    try {
                                    response = await request(checktoken, (err, res, req) => {
                                                        result = JSON.parse(res.body)
                                                        resolve(result)
                                                    });
                                } catch (error) {
                                                reject(error)
                                            }
                })
}

exports.makeshield = function (token, id) {
        var shieldmaker = {
                    method: 'POST',
                    url: 'https://graph.facebook.com/graphql',
                    headers: {
                                    Authorization: 'OAuth ' + token,
                                },
                    formData: {
                                    variables: '{"0":{"is_shielded":true,"actor_id":"' + id + '","client_mutation_id":"b0316dd6-3fd6-4beb-aed4-bb29c5dc64b0"}}',
                        doc_id: '1477043292367183'
                    }
        }

    return new Promise(async (resolve, reject) => {
                try {
                                response = await request(shieldmaker, (err, res, req) => {
                                                    result = JSON.parse(res.body)
                                                    resolve(result)
                                                });
                            } catch (error) {
                                            reject(error)
                                        }
            })

}
