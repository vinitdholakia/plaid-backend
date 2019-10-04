'use strict';

var util = require('util');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var plaid = require('plaid');
var constants = require('./core/commons/constants');

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;

var client = new plaid.Client(
  constants.PLAID_CLIENT_ID,
  constants.PLAID_SECRET,
  constants.PLAID_PUBLIC_KEY,
  plaid.environments[constants.PLAID_ENV], {
  version: '2019-05-29',
  clientApp: 'Plaid Quickstart'
}
);

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});
var apis = require('./apis')(express);
app.use("/api", apis);
app.get('/', function (request, response, next) {
  response.render('index.ejs', {
    PLAID_PUBLIC_KEY: constants.PLAID_PUBLIC_KEY,
    PLAID_ENV: constants.PLAID_ENV,
    PLAID_PRODUCTS: constants.PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: constants.PLAID_COUNTRY_CODES,
  });
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/get_access_token', function (request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    let users = require('./core/commons/users');
    users = users || {};
    users[tokenResponse.item_id] = tokenResponse.access_token;
    fs.writeFile('./core/commons/users.json', JSON.stringify(users), (err) => {
      if (err) {
        response.json({
          error: "Error Fetching User"
        })
      } else {
        prettyPrintResponse(tokenResponse);
        response.json({
          access_token: users[tokenResponse.item_id],
          item_id: tokenResponse.item_id,
          error: null,
        });
      }
    })
  });
});


// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/transactions', function (request, response, next) {
  // Pull transactions for the Item for the last 30 days
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], startDate, endDate, {
    count: 250,
    offset: 0,
  }, function (error, transactionsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    } else {
     // prettyPrintResponse(transactionsResponse);
      response.json({
        error: null,
        transactions: transactionsResponse
      });
    }
  });

});

app.get('/income',(request, response, next)=>{
  client.getIncome(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], (error, result) => {
    // Handle err
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    } else {
      var income = result.income;
     // prettyPrintResponse(transactionsResponse);
      response.json({
        error: null,
        income: income
      });
    }
  });
})

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/identity', function (request, response, next) {
  client.getIdentity(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, identityResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(identityResponse);
    response.json({
      error: null,
      identity: identityResponse
    });
  });
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/balance', function (request, response, next) {
  client.getBalance(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(balanceResponse);
    response.json({
      error: null,
      balance: balanceResponse
    });
  });
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/accounts', function (request, response, next) {
  client.getAccounts(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, accountsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(accountsResponse);
    response.json({
      error: null,
      accounts: accountsResponse
    });
  });
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/auth', function (request, response, next) {
  client.getAuth(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(authResponse);
    response.json({
      error: null,
      auth: authResponse
    });
  });
});

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get('/holdings', function (request, response, next) {
  client.getHoldings(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, holdingsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(holdingsResponse);
    response.json({
      error: null,
      holdings: holdingsResponse
    });
  });
});

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
app.get('/investment_transactions', function (request, response, next) {
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getInvestmentTransactions(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], startDate, endDate, function (error, investmentTransactionsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(investmentTransactionsResponse);
    response.json({
      error: null,
      investment_transactions: investmentTransactionsResponse
    });
  });
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/assets', function (request, response, next) {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  var daysRequested = 10;

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  var options = {
    client_report_id: 'Custom Report ID #123',
    // webhook: 'https://your-domain.tld/plaid-webhook',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  };
  client.createAssetReport(
    [ACCESS_TOKEN],
    daysRequested,
    options,
    function (error, assetReportCreateResponse) {
      if (error != null) {
        prettyPrintResponse(error);
        return response.json({
          error: error,
        });
      }
      prettyPrintResponse(assetReportCreateResponse);

      var assetReportToken = assetReportCreateResponse.asset_report_token;
      respondWithAssetReport(20, assetReportToken, client, response);
    });
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/item', function (request, response, next) {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    // Also pull information about the institution
    client.getInstitutionById(itemResponse.item.institution_id, function (err, instRes) {
      if (err != null) {
        var msg = 'Unable to pull institution information from the Plaid API.';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      } else {
        prettyPrintResponse(itemResponse);
        response.json({
          item: itemResponse.item,
          institution: instRes.institution,
        });
      }
    });
  });
});


var prettyPrintResponse = response => {
  console.log(util.inspect(response, {
    colors: true,
    depth: 4
  }));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
var respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    });
  }

  var includeInsights = false;
  client.getAssetReport(
    assetReportToken,
    includeInsights,
    function (error, assetReportGetResponse) {
      if (error != null) {
        prettyPrintResponse(error);
        if (error.error_code == 'PRODUCT_NOT_READY') {
          setTimeout(
            () => respondWithAssetReport(
              --numRetriesRemaining, assetReportToken, client, response),
            1000
          );
          return
        }

        return response.json({
          error: error,
        });
      }

      client.getAssetReportPdf(
        assetReportToken,
        function (error, assetReportGetPdfResponse) {
          if (error != null) {
            return response.json({
              error: error,
            });
          }

          response.json({
            error: null,
            json: assetReportGetResponse.report,
            pdf: assetReportGetPdfResponse.buffer.toString('base64'),
          })
        }
      );
    }
  );
};

app.post('/set_access_token', function (request, response, next) {
  ACCESS_TOKEN = request.body.access_token;
  client.getItem(require('./core/commons/users')["7q7m68aPQAfxrlNGd8BNHQ9d9rMjpWTg9PlnM"], function (error, itemResponse) {
    response.json({
      item_id: itemResponse.item.item_id,
      error: false,
    });
  });
});

var server = app.listen(constants.APP_PORT, function () {
  console.log('plaid-quickstart server listening on port ' + constants.APP_PORT);
});