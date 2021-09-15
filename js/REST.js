var API = {
  host: "https://iaaa.ddns.net"
};

function nothing(){}
function merge(...arguments) {
  let target = {};
  let merger = (obj) => {
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            target[prop] = merge(target[prop], obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
  };
  for (let i = 0; i < arguments.length; i++) {
      merger(arguments[i]);
  }
  return target;
};  

function emit(f, timeout) {
    setTimeout(f, timeout || 0)
}

var g_timestamp = 0; // текущая временная отметка сессии, меняется при смене сессии (при удачном логине)

// global error function
function Throw(error) {
    throw error;
}

async function do_api_request(n, method, timestamp, headers, request, data) {
    arguments[0]++;
	// console.log("new promise created (", session, ", ", timestamp, ")");
	if (data != undefined)
		console.info("try " + n + ", sending request: ", request.href, data);
	else
		console.info("try " + n + ", sending request: ", request.href);

    // новое поведение - на промисах
    return fetch(request, {
        method: method,
        headers: {
            ...headers,
            'Accept': 'application/json',
            'X-Joatmon-SID': $SESSION
        },
        body: data,
    })
	.then(response => response.status === 200 ? response.json() : Throw(response.status))
    .catch(error => {
		console.log("ERROR", error)
        switch (error) {
            case 401: // not logged in?
				$LoginDialog.Show();
				break;
            case 403:
				$BannedDialog.Show(); // whoopsy
				break;
            case 404: // invalid request
				break;
			default:
				$PingDialog.Show();
				break;
        }
		throw error;
    });
}

// ----------------------------------------------------------------------
// GET = (request, data) => {
// 	console.log("GET!!!", request)
//     var method = "GET";
//     var headers = (data == undefined) ? {} : {
// 		'Content-Type': 'application/json',
// 	};
//     var json = (data == undefined) ? undefined : JSON.stringify(data);
// 	console.log("headers: ", headers)
// 	console.log("json: ", json)
//     return do_api_request(0, method, g_timestamp, headers, request, json);
// }

GET = (request, data) => {
	var method = "GET";
	var request = new URL(API.host + request);
	for (var property in data) {
		request.searchParams.set(property, data[property]);
	}
	var headers = {};
	var json = undefined;
	return do_api_request(0, method, g_timestamp, headers, request, json);
}

PUT = (request, data) => {
    var method = "PUT";
	var request = new URL(API.host + request);
    var headers = {
        'Content-Type': 'application/json',
    };
    var json = JSON.stringify(data);
    return do_api_request(0, method, g_timestamp, headers, request, json);
}

POST = (request, data) => {
    var method = "POST";
	var request = new URL(API.host + request);
    var headers = {
        'Content-Type': 'application/json',
    };
    var json = JSON.stringify(data);
    return do_api_request(0, method, g_timestamp, headers, request, json);
}

PATCH = (request, data) => {
    var method = "PATCH";
	var request = new URL(API.host + request);
    var headers = {
        'Content-Type': 'application/json',
    };
    var json = JSON.stringify(data);
    return do_api_request(0, method, g_timestamp, headers, request, json);
}
