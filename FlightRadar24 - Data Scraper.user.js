// ==UserScript==
// @name         FlightRadar24 - Data Scraper
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Data scraper!
// @author       Nomicwave
// @match        https://www.flightradar24.com/data/aircraft/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flightradar24.com
// @grant        none
// @require      https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js
// @run-at       document-end
// ==/UserScript==

/////////////////////////////////////////////////////////////////////////////////////////////// GLOBAL_BEGIN

/////////////////////////////////////////////////////////////////////////////////////////////// GLOBAL_END

/////////////////////////////////////////////////////////////////////////////////////////////// API_BEGIN

function fnGetCookie(strCookieName) {
    let intEnd;
    let intStart;

    if (document.cookie.length > 0) {
        intStart = document.cookie.indexOf(`${strCookieName}=`);
        if (intStart !== -1) {
            intStart = intStart + strCookieName.length + 1;
            intEnd = document.cookie.indexOf(';', intStart);
            if (intEnd === -1) {
                intEnd = document.cookie.length;
            }
            return unescape(document.cookie.substring(intStart, intEnd));
        }
    }
    return null;
};

let strPk = fnGetCookie('_frPubKey') || '';
let strToken = fnGetCookie('_frPl') || '';
let boolClock12h = parseInt(window.settingsService.syncGetSetting('clock_12h'));
let boolClockLocal = parseInt(window.settingsService.syncGetSetting('clock_local'));
let strTimeFormat = (boolClock12h ? 'h:mm A' : 'HH:mm');

function fnLoadEarlierFlights(iteration, strTimestamp, strFetchBy) {
    const arrRows = document.querySelectorAll('#tbl-datatable tbody tr.data-row');
    const arrRowsNotData = document.querySelectorAll('#tbl-datatable tbody tr:not(.data-row)');

    const lastPlaybackBtn = document.querySelector('#tbl-datatable tbody tr:last-child.data-row .btn-playback');
    const lastFlightId = lastPlaybackBtn ? lastPlaybackBtn.dataset.flightHex : null;

    switch (window.location.pathname.match(/(aircraft|flights|pinned)/gi)[0]) {
        case 'flights':
            strFetchBy = 'flight';
            break;

        case 'aircraft':
        case 'pinned':
            strFetchBy = 'reg';
            break;
    }

    const urlChunks = [
        `query=${window.params.query}`,
        `fetchBy=${strFetchBy}`,
        `page=${iteration}`,
        `pk=${strPk}`,
        `limit=100`,
        `token=${strToken}`,
        `timestamp=${strTimestamp}`,
        `olderThenFlightId=${lastFlightId}`
        ];

        return fetch(`${window.dispatcher.urls.mobileApi}/common/v1/flight/list.json?` + urlChunks.join('&'), {
            credentials: 'omit',
            method: 'GET',
            mode: 'cors',
            redirect: 'follow',
            referrer: window.location.href
        }).then((objResponse) => objResponse.json()).then((objJson) => {
            return objJson.result.response.data;
        }).catch((error) => {
            console.error(error);
        });
    };

function fnFlightDuration(intSeconds) {
    let strResult;
    const objDateDuration = new Date(null);

    if (!intSeconds || intSeconds === 'null') {
        return '-';
    }

    objDateDuration.setSeconds(intSeconds);
    strResult = objDateDuration.toISOString().substr(11, 5);

    return strResult.replace(/^0(\d)/, '$1');
};

/////////////////////////////////////////////////////////////////////////////////////////////// API_END

/////////////////////////////////////////////////////////////////////////////////////////////// SCRIPT_BEGIN

let styles = `
        #fr24_ViewsToolbar #fr24_Download {
            margin-top: 4em;
        }
        @media only screen and (max-height: 660px) {
            #fr24_ViewsToolbar #fr24_Download {
                margin-top: 2.8em !important;
            }
        }
        #fr24_Download {
            float: left;
            clear: left;
            height: 4em;
            margin-bottom: 2px;
        }
        #fr24_Download span {
            display: flex;
            width: 4em;
            height: 4em;
            color: #fff;
            align-items: center;
            justify-content: center;
        }
        #fr24_Download span::before {
            font-size: x-large;
        }
    `

    function captureNetworkRequest(e) {
        let capture_network_request = [];
        let capture_resource = performance.getEntriesByType("resource");
        for (var i = 0; i < capture_resource.length; i++) {
            capture_network_request.push(capture_resource[i].name);
        }
        return capture_network_request;
    }

function constructDownloadBtn() {
    var styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)

    var downloadBtn = document.createElement('li');
    var downloadBtn_a = document.createElement('a');
    var downloadBtn_span = document.createElement('span');

    downloadBtn_span.classList.add('fa', 'fa-download');
    downloadBtn_a.classList.add('dropdown-toggle');
    downloadBtn.id = 'fr24_Download';
    downloadBtn.classList.add('dropdown');

    var placeholder_target = document.getElementById('fr24_ZoomOut');

    downloadBtn.insertAdjacentElement('afterbegin', downloadBtn_a);
    downloadBtn_a.insertAdjacentElement('afterbegin', downloadBtn_span);
    placeholder_target.insertAdjacentElement('afterend', downloadBtn);

    downloadBtn.addEventListener('click', async function () {
        await exportToExcel();
    });
}

function getUserDate(message, placeholder) {
    let dateStr = prompt(message, placeholder);
    if (dateStr === null) return null;
    let dateParts = dateStr.split("/");
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
}

function compileFlightTimestamp(item) {
    if (item.time.scheduled.departure) {
        return item.time.scheduled.departure;
    } else if (item.time.real.departure) {
        return item.time.real.departure;
    } else if (item.time.scheduled.arrival) {
        return item.time.scheduled.arrival;
    } else if (item.time.real.arrival) {
        return item.time.real.arrival;
    } else if (item.time.other.updated) {
        return item.time.other.updated;
    }
}

function compileFlightStatus(item) {
    let status = '';
    if (item.status.generic) {
        let strPrefix = item.status.generic.status.text.ucwords();

        switch (item.status.generic.status.text) {
            case 'estimated':
                if (item.status.generic.status.type === 'departure') {
                    strPrefix = 'Estimated departure';
                    status = strPrefix;
                }
                break;

            case 'diverted':
                delete status.dataset.timestamp;
                if (item.airport.real) {
                    status = `Diverted to ${item.airport.real.code.iata}`;
                } else {
                    status = `Diverted to ${item.status.generic.status.diverted}`;
                }
                break;

            default:
                status = item.status.generic.status.text.ucwords();
        }
    }
    if (item.status.generic.eventTime.utc) {
        status += ` ${window.moment.utc(item.status.generic.eventTime.utc * 1000).format(strTimeFormat)}`;
    }
    return status;
}

function compileFlightTime(item, type) {
    let time = '—';

    switch (type.toLowerCase()) {
        case 'std':
            if (item.airport.origin) {
                time = (item.time.scheduled.departure ? window.moment.utc(item.time.scheduled.departure * 1000).format(strTimeFormat) : '—');
            }
            break;
        case 'atd':
            if (item.airport.origin && item.identification.id) {
                time = (item.time.real.departure ? window.moment.utc(item.time.real.departure * 1000).format(strTimeFormat) : '—');
            }
            break;
        case 'sta':
            if (item.airport.destination) {
                time = (item.time.scheduled.arrival ? window.moment.utc(item.time.scheduled.arrival * 1000).format(strTimeFormat) : '—');
            }
            break;
    }
    return time;
}

function compileFlightData(list, tStart, tEnd) {
    let data = [];
    let filteredList = list.filter(item => {
        let flightDate = compileFlightTimestamp(item);
        return flightDate < tStart + 86400 && flightDate >= tEnd; // 86,400 = 1 day offset
    });

    filteredList.forEach(function (item, index) {
        let flightDate = window.moment.utc(compileFlightTimestamp(item) * 1000).toDate();
        let flightFrom = `${item.airport.origin.position.region.city} (${item.airport.origin.code.iata})`;
        let flightTo = `${item.airport.destination.position.region.city} (${item.airport.destination.code.iata})`;
        let flightNumber = window.fnIsset(item, 'aircraft', 'model', 'code') ? item.aircraft.model.code : '';
        let flightDuration = fnFlightDuration(item.time.other.duration);
        let flightSTD = compileFlightTime(item, 'std');
        let flightATD = compileFlightTime(item, 'atd');
        let flightSTA = compileFlightTime(item, 'sta');
        let flightSatus = compileFlightStatus(item);

        let record = {
            'Date': flightDate,
            'From': flightFrom,
            'To': flightTo,
            'Flight': flightNumber,
            'Flight Time': flightDuration,
            'STD': flightSTD,
            'ATD': flightATD,
            'STA': flightSTA,
            'Status': flightSatus,
        }

        data.push(record);
    });

    return data;
}

async function exportToExcel() {
    let pDateFrom = getUserDate('Get flight data from date..?', new Date().toLocaleDateString("en-GB"));
    if (pDateFrom === null) return;

    let pDateTo = getUserDate('..to date..?', new Date().toLocaleDateString("en-GB"));
    if (pDateTo === null) return;

    let filename = `(${window.params.query}-${(new Date().getTime())}) flight history - ${window.moment.utc(pDateFrom).format('DD MMM YYYY')} to ${window.moment.utc(pDateTo).format('DD MMM YYYY')}.xlsx`;

    pDateFrom = pDateFrom.getTime()/1000;
    pDateTo = pDateTo.getTime()/1000;

    let iteration = 1;
    let flightHistory = [];
    let flightDateMia = true;

    while (flightDateMia) {
        let result = await fnLoadEarlierFlights(iteration++, pDateFrom)
        flightHistory = result.concat(flightHistory);
        ;
        let earliestFlight = flightHistory.at(-1);
        let intFlightDate = compileFlightTimestamp(earliestFlight);

        if (+pDateTo >= +intFlightDate) flightDateMia = false;
        else continue
    }

    flightHistory = compileFlightData(flightHistory, pDateFrom, pDateTo);
    console.log(flightHistory);

    let worksheet = XLSX.utils.json_to_sheet(flightHistory, { cellDates: true, dateNF: 'DD MMM YYYY' });
    let workbook = XLSX.utils.book_new();
    worksheet = autoFitColumns(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight History');
    XLSX.writeFile(workbook, filename);
}

function autoFitColumns(worksheet) {
    let objectMaxLength = [];
    const [firstCol, lastCol] = worksheet['!ref']?.replace(/\d/, '').split(':')
    const numRegexp = new RegExp(/\d+$/g)
    const firstColIndex = firstCol.charCodeAt(0),
          lastColIndex = lastCol.charCodeAt(0),
          rows = +numRegexp.exec(lastCol)[0]

    // Loop on columns
    for (let colIndex = firstColIndex; colIndex <= lastColIndex; colIndex++) {
        const col = String.fromCharCode(colIndex)
        let maxCellLength = 0

        // Loop on rows
        for (let row = 1; row <= rows; row++) {
            let value = worksheet[`${col}${row}`].v;
            if (Object.prototype.toString.call(value) === '[object Date]') {
                value = window.moment.utc(value).format('DD MMM YYYY');
            }
            const cellLength = value.length + 1
            if (cellLength > maxCellLength) maxCellLength = cellLength
        }

        objectMaxLength.push({ width: maxCellLength })
    }
    worksheet['!cols'] = objectMaxLength;
    return worksheet;
}

function DownloadJsonData(JSONData, FileTitle, ShowLabel) {
    let arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    let CSV = '';

    if (ShowLabel) {
        let row = "";
        for (let index in arrData[0]) {
            row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }
    for (let i = 0; i < arrData.length; i++) {
        let row = "";
        for (let index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }
    if (CSV == '') {
        alert("Invalid data");
        return;
    }
    let filename = FileTitle + (new Date());
    let blob = new Blob([CSV], {
        type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) {
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.style = "visibility:hidden";
            link.download = filename + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

(function() {
    constructDownloadBtn();
})();

/////////////////////////////////////////////////////////////////////////////////////////////// SCRIPT_END
