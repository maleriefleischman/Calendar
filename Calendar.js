/*
 * Calendar
 * @author Calendar template credited to https://code.tutsplus.com/tutorials/how-to-build-a-beautiful-calendar-widget--net-12538
 * @author(secondary) Modifications and datasheet related functionality by Malerie Fleischman
 * @mentors - guidance, direction, and helpful tips by Jeremy C
 *
 * Calendar that visually represents if an item has been ordered on a specific day by highlighting green or red
 *
 *
 */

// Order information from provided excel sheet
var datasheet;
// Category of interest to evaluate orders, defaults to "Meat"
var itemSelect = "Meat";
// Current month being viewed
var currMonth;
// Current year being viewed
var currYear;
// Last two digits of current year being viewed
var simpYear;
// Call Calendar function
var cal;
// If using .hover(). Holds value of date/order amount so that values can be switched back after hover event
var swap;

$(document).ready(function(){

// Papa.parse is a plugin that allows for easy parsing of .csv documents
    Papa.parse("./datasheet.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results){
            datasheet = results.data;
// have calendar load after datasheet finishes loading
                cal = CALENDAR();
                cal.init();
        }
    });

    $("#drop-down").on('change', function(){
        itemSelect = $(this).val();
        Papa.parse("./datasheet.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function(results){

                // have calendar re-load when category changed
                cal.switchMonth(null,currMonth-1,currYear)
            }
        })
    });

    $("#refresh").on("click",function(e){
        e.preventDefault();
        Papa.parse("./datasheet.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function(results){

                // have calendar re-load when refresh button pressed
                cal.switchMonth(null,currMonth-1,currYear);
            }
        })

    });

});


var CALENDAR = function () {
    var wrap, label,
        months = ["January", "February", "March", "April", "May", "June", "July","August", "September", "October", "November", "December"];

    function init(newWrap) {
        wrap  = $(newWrap || "#cal");
        label = wrap.find("#label");

        wrap.find("#prev").bind("click.calender", function () { switchMonth(false); });
        wrap.find("#next").bind("click.calender", function () { switchMonth(true); });
        label.bind("click.calendar", function () { switchMonth(null, new Date().getMonth(), new Date().getFullYear() ); });
        label.click();
    }

    function switchMonth(next, month, year) {
        var curr = label.text().trim().split(" "), calendar, tempYear = parseInt(curr[1], 10);


        if (!month) {
            if (next) {
                if (curr[0] === "December") {
                    month = 0;
                } else {
                    month = months.indexOf(curr[0]) + 1;
                }
            } else {
                if (curr[0] === "January") {
                    month = 11;
                } else {
                    month = months.indexOf(curr[0]) - 1;
                }
            }
        }

        if (!year) {
            if (next && month === 0) {
                year = tempYear + 1;
            } else if (!next && month === 11) {
                year = tempYear - 1;
            } else {
                year = tempYear;
            }
        }

        //global variables for use in match function
        currMonth = month+1;
        currYear = year;
        // datasheet entries only have last 2 digits for the year, so find last two digits of current year
        simpYear = parseInt(currYear.toString().split('')[2] + currYear.toString().split('')[3]);

        calendar = createCal(year, month);

        // Removes all handlers attached to the elements so that handlers can be re-intiated when changing months
        $("td.day").off();

        $("#cal-frame", wrap)
            .find(".curr")
            .removeClass("curr")
            .addClass("temp")
            .end()
            .prepend(calendar.calendar())
            .find(".temp")
            .fadeOut("fast", function () { $(this).remove(); });
        label.text(calendar.label);

    // tooltip on hover as requested

      $("td.day").tooltip();



        //(More stylish) hover innerHTML swap

  /*      $("td.day").hover(function (e) {
            swap = e.currentTarget.innerHTML;
            e.currentTarget.innerHTML = e.currentTarget.getAttribute("data-amount");
        },function (e) {
            if(swap) {
                e.currentTarget.innerHTML = swap;
            }
            swap = undefined;
        })
*/

    }




    function createCal(year, month) {
        var day = 1, i, j, haveDays = true,
            startDay = new Date(year, month, day).getDay(),
            daysInMonth = [31, (((year%4===0)&&(year%100!==0))||(year%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
            calendar = [];

        i = 0;
        while(haveDays) {
            calendar[i] = [];
            for (j = 0; j < 7; j++) {
                if (i === 0) {
                    if (j === startDay) {
                        calendar[i][j] = day++;
                        startDay++;
                    }
                } else if ( day <= daysInMonth[month]) {
                    calendar[i][j] = day++;
                } else {
                    calendar[i][j] = "";
                    haveDays = false;
                }
                if (day > daysInMonth[month]) {
                    haveDays = false;
                }
            }
            i++;
        }

        /*
         * Create html formatted days for the current month.
         * Run match function to determine class (true,false) of each day:
         * True = > 0 orders for selected item
         * False = No orders for selected item
         *
         * @param (number) currDay - Current day being generated
         * @param (number) ordersMade - result(s) of match function (resets with each re-run)
         *
         */

        var htmlCal = "";
        for (i=0; i< calendar.length; i++){
            //add html row open
            htmlCal +=  "<tr>";
            for (j=0; j<calendar[i].length;j++){
                //td opens

                if (calendar[i][j]) {
                    //do the sht
                    var currDay = calendar[i][j];
                    var ordersMade = match(currDay, currMonth, simpYear, itemSelect);


                    if (ordersMade) {
                        htmlCal += "<td title = \"" + ordersMade + "\" class=\"day true \"" + " data-amount=  \"" + ordersMade + "\">" + calendar[i][j];
                    }

                    else{
                        htmlCal += "<td title = \"0\" class=\"day false \" data-amount=\"0\">" + calendar[i][j];
                    }
                }
                else{
                    // td class nil
                    htmlCal += '<td class="nil">';
                }
                //td closes
                htmlCal += '</td>';
            }
            //html row closes
            htmlCal += '</tr>';
        }

        //Insert generated days into a <table></table>
        calendar = $("<table>" + htmlCal + "</table").addClass("curr");

        $("td:empty", calendar).addClass("nil");

        if (month === new Date().getMonth()) {
            $('td', calendar).filter(function () { return $(this).text() === new Date().getDate().toString(); }).addClass("today");
        }


        return { calendar : function () { return calendar.clone(); }, label : months[month] + " " + year };

    }
    createCal.cache = {};

    return {
        init : init,
        switchMonth : switchMonth,
        createCal : createCal
    };

};

/* match function, compares each day with info in datasheet
 * @param (number) orderMonth - Month that an order was made
 * @param (number) orderYear - Year that an order was made
 * @param (number) orderDay - Day that an order was made
 *
 * True = > 0 orders for selected item
 * False = No orders for selected item
 */

function match (day, month, year, select){
    for (var j=0; j<datasheet.length; j++){
        var orderMonth = datasheet[j].Date.split("/")[0];
        var orderYear = datasheet[j].Date.split("/")[2];
        var orderDay = datasheet[j].Date.split("/")[1];

        if ((select === datasheet[j].Category) && (day === parseInt(orderDay)) && (month == parseInt(orderMonth)) && (year === parseInt(orderYear))){
            if (parseInt(datasheet[j].Quantity) > 0){
                return parseInt(datasheet[j].Quantity);
             }

             else{

                return 0;
            }
        }
    }
}
