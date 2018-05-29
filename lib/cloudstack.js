var request = require('request')
  , crypto = require('crypto');



function _request(uri, cmd) {
	return new Promise(function(resolve, reject) {
		request(uri, function(err, res, body) {
			if (err) {
				reject(err);
			} else {
				var parsedBody = JSON.parse(body);
				if (res.statusCode == 200) {
					var result = parsedBody[cmd.toLowerCase() + 'response'];
					resolve(null, result);
				} else {
					resolve(null, parsedBody);	
				}
			}
		});	
	})
}

module.exports = function cloudstack(options) {
	if (!options) {
		options = {};
	}
	
	var apiUri = options.apiUri || process.env.CLOUDSTACK_API_URI
	  , apiKey = options.apiKey || process.env.CLOUDSTACK_API_KEY
	  , apiSecret = options.apiSecret || process.env.CLOUDSTACK_API_SECRET;

	this.exec = async function(cmd, params, callback) {
		var paramString = genSignedParamString(
			apiKey, 
			apiSecret, 
			cmd,
			params
		);

		var uri = apiUri + '?' + paramString;

		if ("fetch_list" in params) {
			let vfinal_data = {};
			let done = false;
			params.page = 1;
			params.pagesize = 500;

			let the_key = undefined;

			while (!done) {
				var paramString = genSignedParamString(
					apiKey, 
					apiSecret, 
					cmd,
					params
				);
				var uri = apiUri + '?' + paramString;
				await _request(uri, cmd).then(function(response) {
					if (the_key) {
						if (the_key in response) {
							final_data[the_key] = final_data[the_key].concat(response[the_key])
						} else {
							done = true;
						}
					} else {
						final_data = response;
						for (let key of Object.keys(response)) {
							if (key != "count") {
								the_key = key;
							}
						}
					}
				});
				params.page = params.page + 1;
			}
			callback(null, final_data);
		} else {
			var paramString = genSignedParamString(
				apiKey, 
				apiSecret, 
				cmd,
				params
			);
	
			var uri = apiUri + '?' + paramString;

			_request(uri, cmd).then(function(response) {
				callback(null, response)
			}, function(error) {
				callback(error, null)
			});
		}
	};

	var genSignedParamString = function(apiKey, apiSecret, cmd, params) {
		params.apiKey = apiKey;
		params.command = cmd;		
		params.response = 'json';

		var paramKeys = [];
		for(var key in params) {
			if(params.hasOwnProperty(key)){
				paramKeys.push(key);
			};
		};
		
		paramKeys.sort();
		
		var qsParameters = [];
		for(var i = 0; i < paramKeys.length; i++) {
			key = paramKeys[i];
			qsParameters.push(key + '=' + encodeURIComponent(params[key]));
		}

		var queryString = qsParameters.join('&')
		  , cryptoAlg = crypto.createHmac('sha1', apiSecret)
		  , signature = cryptoAlg.update(queryString.toLowerCase()).digest('base64');

		return queryString + '&signature=' + encodeURIComponent(signature);
	};
};