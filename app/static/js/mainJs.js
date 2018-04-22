/**
 * Created by Alex-PC on 25/07/2017.
 */

function getUrl(type) {

    if(type == "url"){
        var a = {"url": $('#urlInput').val() };
        var call = "/get_url";

    }

    if(type == "other"){
        var a = {"other": $('#hashInput').val() };

        var call = "/get_other";
    }

    if(emptyCheck(a)){
        return
    }


    $.ajax({
        type: 'POST',
        url: call,
        data: JSON.stringify(a),
        contentType: 'application/json;charset=UTF-8',
        success: function (data) {

            displayResults(data,type)

        }
    });
}

function getIP() {

    var a = {"IP": $('#IPinput').val() };

    var call = "/get_IP";

    if(emptyCheck(a)){
        return
    }

    $.ajax({
        type: 'POST',
        url: call,
        data: JSON.stringify(a),
        contentType: 'application/json;charset=UTF-8',
        success: function (data) {

            if(data.result == false){

                alert("No results or Invalid IP Address")
            }

            if(data.result == "apiError"){

                alert("Invalid API Key");
                return
            }


            if (data.result == "limitReached") {
                alert('API limit reached');
                return
            }

            var counter = 0;
            $('#results').empty();

            $.each(data.detected_urls, function (i, item) {

                var $result = $("<a>", {class: "list-group-item", id: "result" + counter});
                $result.appendTo($('#results'));
                var text = String(item.positives+"/"+ item.total);
                $("#result" + counter).text( text+ "       " + item.scan_date + "       " + item.url);
                counter++


            })


        }
    })



}

var mainFunc = (function() {

    var count = 0;
    return {

        a_func: function () {

            if (($('#apiInput').val()).length === 0) {

                alert("Invalid API Key");
                return
            }

            $.ajax({
                type: 'POST',
                url: "/set_apiKey",
                data: JSON.stringify({"api": $('#apiInput').val(), "id": count}),
                contentType: 'application/json;charset=UTF-8',
                success: function (data) {

                    var apiDiv2 = getElement(count)['apiDiv2'];
                    var $apiDiv = getElement(count)['apiDiv'];

                    var apiValue = $('#apiInput').val();
                    $($apiDiv).appendTo($('#apiList'));
                    $('#api' + count).text(apiValue);
                    $(apiDiv2).appendTo("#api" + count);

                    setcookie("api" + count, apiValue, 3);
                    $('#apiInput').val('');

                    count++

                }
            });

        },
        b_func: function () {

            var cookieDict = Cookies.get();
            var validCookies = {};
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    return this.substr(position || 0, searchString.length) === searchString;
                };
            }
            for(var key in cookieDict){
                if (key.startsWith("api")){
                    validCookies[key] = cookieDict[key]
                }
            }


            sendApiKeys(validCookies);
            $.each(validCookies, function (key, value){


                var apiDiv2 = getElement(count)['apiDiv2'];
                var $apiDiv = getElement(count)['apiDiv'];

                $($apiDiv).appendTo($('#apiList'));
                $('#api' + count).text(value);
                $(apiDiv2).appendTo("#api" + count);
                count++

                    })

        }
    };

})();

function getApiKey() {

    mainFunc.a_func();

}

function emptyCheck(data){


    if(data.length === 0){
        return true
    }
    else{

        return false
    }


}

// horribly written , needs rewriting
function getBatch() {

    $('#submit').prop('disabled', true);

    var apiKeyCount = $('#apiList').children().length;
    var hashCount = $('#hashInput').val().replace(/\s/g, " ").split(" ").filter(function (t) {
        return t !== ""
    }).length;
    var clock = $('#clock');
    clock.show();
    clearInterval(x);

    var time = ((hashCount / apiKeyCount) / 4) * 60 * 1000;
    calculatedTime = new Date().setTime(new Date().getTime() + time);

    var x = setInterval(function () {

        var distance = calculatedTime - new Date().getTime();
        var seconds = getTime(distance).seconds;
        var minutes = getTime(distance).minutes;
        clock.html("Estimated time remaining: " + "Minutes: " + minutes + " " + "Seconds: " + seconds);

        if (distance <= 0) {           // if statement needs to be here or clock wont disappear, not a clue why

            clock.html('');
            clearInterval(x);
            clock.hide();

        }

    }, 100);


    if (apiKeyCount === 0 || hashCount === 0) {
        alert("no hashes or no api keys");
        return
    }

    var data = $('#hashInput').val();

    $.ajax({
        type: 'POST',
        url: "/get_batch",
        data: JSON.stringify({'data': data}),
        contentType: 'application/json;charset=UTF-8',
        success: function (data) {
            clock.hide();
            counter = 0;
            $('#results').empty();
            var notCovered = [];
            for (var i in data) {


                if(data[i].hasOwnProperty('error') === false) {
                    if (data[i].results['response_code'] === 1) {
                        if (data[i].results.scans.McAfee.detected === true || data[i].results.scans['McAfee-GW-Edition'].detected === true) {

                            var coveredIcon = getElement(counter)['covered'];
                            var id = "result" + counter;
                            var $resultDanger = $("<a>", {
                                class: "list-group-item list-group-item-danger",
                                id: "result" + counter
                            });

                            $resultDanger.appendTo($('#results'));
                            $('#' + id).text(data[i].results.resource);
                            $('#' + id).append(coveredIcon);
                            counter++
                        }else{
                            notCovered.push(data[i])
                        }
                    }else{
                         notCovered.push(data[i])
                    }

                }else {
                    notCovered.push(data[i])
                }
            }
            for (var x in notCovered) {

                var message = "";
                var hashMsg = "";


                if (notCovered[x].hasOwnProperty('error') == true) {
                    message = notCovered[x]['error']

                }
                else if (notCovered[x].results['response_code'] === 0) {
                    message = notCovered[x].results['verbose_msg'];
                    hashMsg = notCovered[x].results.resource
                }
                else{
                    message = "not covered";
                    hashMsg = notCovered[x].results.resource
                }

                var notcoveredIcon = getElement(counter)['uncovered'];
                var id = "result" + counter;
                var $result = $("<a>", {class: "list-group-item", id: id});
                $result.appendTo($('#results'));
                $('#' + id).text(hashMsg + ":" + message);
                $('#' + id).append(notcoveredIcon);

                counter++
            }
            $('#submit').prop('disabled', false);
        }


    })


}

function displayResults(data,type){



    if (data.result === false) {

        if (type == "url") {
            alert('URL not found or URL is invalid');
            return
        }

        if (type == "other") {
            alert('Hash not found or hash is invalid');
            return
        }
    }
    if (data.result === "apiError") {
        alert('Invalid API Key');
        return
    }

    if (data.result === "limitReached") {
        alert('API limit reached');
        return
    }

    var counter = 0;
    $('#results').empty();
    $('#symbol').remove();

    if(data.detected.hasOwnProperty('McAfee') || data.hasOwnProperty('McAfee-GW-Edition')){

      $('#mcafeeCovered').append('<a><i id = "symbol" class="glyphicon glyphicon-ok"></i></a>')
    }
    else{
        $('#mcafeeCovered').append('<a><i id = "symbol" class="glyphicon glyphicon-alert"></i></a>')
    }


    $.each(data.detected, function (key, value) {

        var $result = $("<a>", {class: "list-group-item list-group-item-danger", id: "result" + counter});
        $result.appendTo($('#results'));
        $("#result" + counter).text(key + " - " + value.detected + " " + value.result);
        $('#results a:last').hide().fadeIn(500);
        counter++
    });

    $.each(data.notDetected, function (key, value) {

        var $result = $("<a>", {class: "list-group-item", id: "result" + counter});
        $result.appendTo($('#results'));

        $("#result" + counter).text(key + " - " + value.detected + " " + value.result);
        $('#results a:last').hide().fadeIn(500);
        counter++


    })



}

function removeItem(element){


    var parent =  $('#'+element).closest("div");
    $.ajax({type: 'POST',
            url: 'remove_api_key',
            data: JSON.stringify({'apiKey': parent.text()}),
            contentType: 'application/json;charset=UTF-8'
            });

    apiKeyDict = Cookies.get();
    for (var key in apiKeyDict){

        aValue = apiKeyDict[key];
        if(aValue == parent.text()){
             removeCookies(key);
             break;

        }

    }

    parent.remove()



}

function setcookie(cname , cvalue, exdays){

   Cookies.set(cname, cvalue,{expires : exdays});}

function removeCookies(cname){

    Cookies.remove(cname);
}

function getElement(count) {

    var elementDict = {

        'apiDiv2': '<span class="pull-right">' +
        '<span class="btn btn-xs btn-default" id = "button' + count + '"' + 'onclick="removeItem(this.id)" )">' +
        '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
        '</span>' +
        '</span>',

        'apiDiv': $('<div>', {class: "list-group-item", id: "api" + count}),

        'uncovered': '<span class="pull-right">' +
        '<span class="glyphicon glyphicon-alert"></span>' +
        '</span>',


        'covered': '<span class="pull-right">' +
        '<span class="glyphicon glyphicon-ok"></span>' +
        '</span>'


    };

        return elementDict


}

function sendApiKeys(apiDict) {

    returnList = [];
    for(var key in apiDict){
        returnList.push(apiDict[key])
    }


    $.ajax({type: 'POST',
            url: "/get_api_keys",
            data: JSON.stringify({'apiList': returnList}),
            contentType: 'application/json;charset=UTF-8'})
}

$(function () {

    $('#upload-file-btn').click(function () {


        var file = new FormData($('#upload-file')[0]);
        $.ajax({
            url: '/upload_file',
            type: 'POST',
            data: file,
            cache: false,
            processData: false, // Don't process the files
            contentType: false,
            success: function (data) {
                displayResults(data, "other");

            }
        })


    })
});

function getTime(time) {

    return {
        "seconds": Math.floor((time % (1000 * 60)) / 1000),
        "minutes": Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
    }


}

$(document).ready(function () {

    $('[data-toggle="popover"]').popover({placement: "right", trigger: "hover"});

    if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {

        $("textarea").resizable({
            handles: "se"
        });
    }

    mainFunc.b_func();
    $('#clock').hide();



});






