// GLOBAL VARIABLES
const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const morg = require("morgan");
const GoogleSpreadsheet = require('google-spreadsheet');
const GoogleSpreasdheetCredentials = require('./client_secret.json');
const States = require('./states.js');
const stringify = require("json-stringify-pretty-compact")

const PORT = process.env.PORT || 5001;
const app = express();

class State {
    constructor(name, abbreviation) {
        this.name = name;
        this.abbreviation = abbreviation;
    }
}

// logging for request to the console
app.use(morg("dev"));

// Configure body parser for AJAX requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
    app.use(express.static("app/build"));
}

// Create a document object using the ID of the spreadsheet - obtained from its URL.
let ssid = process.env.TOWS_SSID || '1HmO3TypMMJFnWoQddTgeWwl_l7GUi-BQOl2bgJkEv-w';
let GoogleSpreadsheetData = new GoogleSpreadsheet(ssid);

// HELPER METHODS
function filterOutDuplicates(arr) {
    let seen = {};
    let out = [];
    const len = arr.length;
    let j = 0;
    for(let i = 0; i < len; i++) {
        let item = arr[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

function filterOnlyStates(arr) {
    let usa_states_abbr = arr.filter((abbr) => {
        for (let state in States.states) {
            if (state == abbr) {
                return state == abbr;
            }
        }
    })
    return usa_states_abbr;
}

function mapArrValuesToCount(arr) {
    return arr.reduce(function(prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
      }, {});
}

// ROUTES
app.get('/api/slaves', (req, res) => {
    // res.json("Testing this");
    GoogleSpreadsheetData.useServiceAccountAuth(GoogleSpreasdheetCredentials, function (err) {
        // Get all of the rows from the spreadsheet.
        GoogleSpreadsheetData.getRows(1, function (err, rows) {
            let data = rows;
            res.json(data);
        });
    });
})

app.get('/api/slaveowners', (req, res) => {
    GoogleSpreadsheetData.useServiceAccountAuth(GoogleSpreasdheetCredentials, function (err) {
        // Get all of the rows from the spreadsheet.
        GoogleSpreadsheetData.getRows(1, function (err, rows) {
            let data = rows;
            let slaveowners = [];
            // Get all of the slave owners from the Spreadsheet
            for (var owner in data) {
                // console.log(data[owner].slaveowners);
                slaveowners.push(data[owner].slaveowners);
            }
            res.json(slaveowners);
        });
    });
})
// Retrieve all of the states that slave owners and slaves were in
// output: An Array of State Objects with properties of abbreviation and name
app.get('/api/states', (req, res) => {
    GoogleSpreadsheetData.useServiceAccountAuth(GoogleSpreasdheetCredentials, function (err) {
        // Get all of the rows from the spreadsheet.
        GoogleSpreadsheetData.getRows(1, function (err, rows) {
            let data = rows;
            let ownerstate = [];
            // Get all of the slave owners' states from the Spreadsheet
            for (var state in data) {
                ownerstate.push(data[state].ownerstate);
            }
            let filtered = filterOutDuplicates(ownerstate);
            let only_states = filterOnlyStates(filtered);
            let arr = [];
            for (let state in only_states) {
                let name = States.states[only_states[state]];
                let abbreviation = only_states[state];

                let new_state = new State(name, abbreviation);
                // push the states unabbreviated into an array
                arr.push(new_state);
            }
            res.json( arr );
        });
    });
})

app.get('/api/insurancefirms', (req, res) => {
    GoogleSpreadsheetData.useServiceAccountAuth(GoogleSpreasdheetCredentials, function (err) {
        // Get all of the rows from the spreadsheet.
        GoogleSpreadsheetData.getRows(1, function (err, rows) {
            let data = rows;
            let insurancefirms = [];
            // Get all of the slave owners' states from the Spreadsheet
            for (var insurer in data) {
                insurancefirms.push(data[insurer].insurancefirm);
            }
            insurancefirms.sort();
            var countMap = mapArrValuesToCount(insurancefirms)
            res.json(countMap);
        });
    });
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/app/build/index.html'));
});

app.listen(PORT);

console.log(`App listening on ${PORT}`);