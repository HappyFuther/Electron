let $ = require("jquery"); // jQuery now loaded and assigned to $
let count = 0;

let months = ['ALAAM','OMEN','RAISA','MIA','UNA','RIPA','SPAA','AMIA','DAISA','RA','PIAA','TEMIAA'];
let gregMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CustomDate(year, month, day) {
  // Calculate the number of days since the start of the custom calendar
  var daysSinceStart = (year - 1) * 360 + (month - 1) * 30 + day;

  // Define the start of the Gregorian calendar (January 1, 1 AD)
  var gregorianStart = new Date(-13796, 9, 22);

  // Calculate the number of milliseconds between the start of the Gregorian calendar and the start of the custom calendar
  var customOffset = daysSinceStart * 24 * 60 * 60 * 1000;
  
  // Calculate the date in the Gregorian calendar by adding the custom offset to the start of the Gregorian calendar
  var gregorianDate = new Date(gregorianStart.getTime() + customOffset);

  // Extract the year, month, and day from the Gregorian date
  this.year = gregorianDate.getFullYear();
  this.month = gregorianDate.getMonth() + 1; // Add 1 because getMonth() returns a zero-based index
  this.day = gregorianDate.getDate();
}

function ConvertGregianToCustom(year, month, day) {
   var gregorianDate = new Date(year, month - 1, day);

   var gregorianStart = new Date(-13796, 9, 22);
   customOffset = gregorianDate.getTime() - gregorianStart.getTime();
   daysSinceStart = Math.floor(customOffset / 24 / 60 / 60 / 1000);
   let custYear = Math.floor(daysSinceStart / 360) + 1;
   let custMonth = Math.floor((daysSinceStart - (custYear - 1) * 360) / 30) % 30 + 1;
   let custDay = Math.floor(daysSinceStart - (custYear - 1) * 360 - (custMonth - 1) * 30) + 1;

   this.year = custYear;
   this.month = custMonth;
   this.day = custDay;
}

function makeCustomCalendarContent(year, month) {
   var content = "<thead><tr><th>AEMA</th><th>AMMA</th><th>HOA</th><th>DREMA</th><th>KEBA</th><th>REA</th><th>FIDA</th><th>LORSA</th><th>DROBA</th><th>ELPA</th></tr><tr><th>IRISA</th><th>IRITA</th><th>HODA/AERSA</th><th>EIRA/KIRA</th><th>SIHA</th><th>SONIA</th><th>MENIA</th><th>OBUA/DAISA</th><th>HOPA/RAISA</th><th>MIA RA</th></tr></thead><tbody>";
   
   cusDay = 1;
   oldMonth = 0;
   for (i = 0; i < 3; i++) {
      content += "<tr>";
      for (j = 0; j < 10; j++) {
         newDate = new CustomDate(year, month, cusDay);
         content += "<td>";
         content += cusDay++ ;
         if (oldMonth != newDate.month) {
            oldMonth = newDate.month;
            content += "<br><span class='text-danger'> "+(gregMonths[newDate.month-1]+" "+newDate.day)+"</span>";
         } else {
            content += "<br><span class='text-danger'> "+(newDate.day)+"</span>";
         }
         content += "</td>";
      }
      content += "</tr>";
   }
   content += "</tbody>";
   return content;
}

function makeGregorianCalendarContent(year, month) {
   const daysInMonth = new Date(year, month, 0).getDate();
   const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
   
   let calendar = "<thead><tr>";
   
   // Add day labels
   const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
   let scdTr = "";
   for (let i = 0; i < daysOfWeek.length; i++) {
   calendar += "<th>" + daysOfWeek[i] + "</th>";
   scdTr += "<th></th>";
   }
   
   calendar += "</tr><tr>" + scdTr + "</tr></thead><tbody><tr>";
   
   // Add empty cells for days before the first of the month
   for (let i = 0; i < firstDayOfMonth; i++) {
      calendar += "<td></td>";
   }
   
   // Add cells for each day in the month
   oldMonth = 0;
   for (let i = 1; i <= daysInMonth; i++) {
      tmpDate = new ConvertGregianToCustom(year, month, i);
      if (oldMonth != tmpDate.month) {
         oldMonth = tmpDate.month;
         calendar += "<td>" + i + "<br><span class='text-danger'> "+(months[tmpDate.month-1]+" "+tmpDate.day)+"</span></td>";
      } else {
         calendar += "<td>" + i + "<br><span class='text-danger'> "+tmpDate.day+"</span></td>";
      }
   
      if ((firstDayOfMonth + i) % 7 === 0) {
         calendar += "</tr><tr>";
      }
   }
   
   // Add empty cells for days after the end of the month
   if ((firstDayOfMonth + daysInMonth) % 7 !== 0) {
      const remainingDays = 7 - ((firstDayOfMonth + daysInMonth) % 7);
      for (let i = 0; i < remainingDays; i++) {
         calendar += "<td></td>";
      }
   }
   
   calendar += "</tr></tbody>";
   return calendar;
}

function updateContent() {
   showFlag = $("#custRadio").get(0).checked;
   if (showFlag) {
      var year = $("#cusYear").val() * 1;
      var month = $("#cusMonth").val() * 1;
      content = makeCustomCalendarContent(year, month);
      $("#customCalendar").html(content);
      $("#customCalendar").removeClass("gregorian").addClass("custom");
   } else {
      var year = $("#gregYear").val() * 1;
      var month = $("#gregMonth").val() * 1;
      
      content = makeGregorianCalendarContent(year, month);
      $("#customCalendar").html(content);
      $("#customCalendar").removeClass("custom").addClass("gregorian");
   }
}

$('#cusYear').on("change", function(e) {
   // e.stopImmediatePropagation();
   y = $("#cusYear").val();
   m = $("#cusMonth").val();
   newDate = new CustomDate(y, m, 1);
   $("#gregYear").val(newDate.year);
   $("#gregMonth").val(newDate.month);
   updateContent();
})

$('#cusMonth').on("change", function(e) {
   // e.stopImmediatePropagation();
   y = $("#cusYear").val();
   m = $("#cusMonth").val();
   newDate = new CustomDate(y, m, 1);
   $("#gregYear").val(newDate.year);
   $("#gregMonth").val(newDate.month);
   updateContent();
})

$('#gregYear').on("change", function(e) {
   // e.stopImmediatePropagation();
   y = $("#gregYear").val();
   m = $("#gregMonth").val();
   custDate = new ConvertGregianToCustom(y, m, 1);
   $("#cusYear").val(custDate.year);
   $("#cusMonth").val(custDate.month);
   updateContent();
})

$('#gregMonth').on("change", function(e) {
   // e.stopImmediatePropagation();
   y = $("#gregYear").val();
   m = $("#gregMonth").val();
   custDate = new ConvertGregianToCustom(y, m, 1);
   $("#cusYear").val(custDate.year);
   $("#cusMonth").val(custDate.month);
   updateContent();
});

$('[name=calendarFlag]').on("change", function(e) {
   updateContent();
});

const ipcRenderer = require("electron").ipcRenderer;

function printDivToPDF(id) {
   let element = document.getElementById(id);
   let range = new Range();
   range.setStart(element, 0);
   range.setEndAfter(element, 0);
   document.getSelection().removeAllRanges();
   document.getSelection().addRange(range);
   ipcRenderer.send('exportSelectionToPDF');
}

let nowDate = new Date();
custDate = new ConvertGregianToCustom(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
$("#cusYear").val(custDate.year);
$("#cusMonth").val(custDate.month);
gregDate = new CustomDate(custDate.year, custDate.month, 1);
$("#gregYear").val(gregDate.year);
$("#gregMonth").val(gregDate.month);
updateContent();

function defaultPrint(str) {
   showFlag = $("#custRadio").get(0).checked;
   if (showFlag) {
      var year = $("#cusYear").val() * 1;
      var month = $("#cusMonth").val() * 1;
      monthName = months[month - 1];
      tblClass = "table text-center table-bordered custom";
   } else {
      var year = $("#gregYear").val() * 1;
      var month = $("#gregMonth").val() * 1;
      monthName = gregMonths[month - 1];
      tblClass = "table text-center table-bordered gregorian";
   }
   printContent = "<style>div.labelMark {font-size:18pt; font-weight:bold;}</style>";
   printContent += "<div class='labelMark'>" + year + "</div><hr><div class='labelMark'>" + month + "&nbsp;" + monthName + "</div>";
   printContent += "<table class='" + tblClass + "'>" + $("#customCalendar").html() + "</table>";
   $("iframe").get(0).contentDocument.querySelector("#container").innerHTML = printContent;
   $("iframe").get(0).contentWindow.print();
}

function allPrint(str) {
   printContent = "<style>div.labelMark {font-size:18pt; font-weight:bold;}</style>";
   showFlag = $("#custRadio").get(0).checked;
   if (showFlag) {
      var year = $("#cusYear").val() * 1;
      tblClass = "table text-center table-bordered custom";
      for (var i=0; i<12; i++) {
         var month = i + 1;
         monthName = months[month - 1];
         printContent += "<div class='labelMark'>" + year + "</div><hr><div class='labelMark'>" + month + "&nbsp;" + monthName + "</div>";
         printContent += "<table class='" + tblClass + "'>" + makeCustomCalendarContent(year, month) + "</table><br/>";
      }
   } else {
      var year = $("#gregYear").val() * 1;
      tblClass = "table text-center table-bordered gregorian";
      for (var i=0; i<12; i++) {
         var month = i + 1;
         monthName = gregMonths[month - 1];
         printContent += "<div class='labelMark'>" + year + "</div><hr><div class='labelMark'>" + month + "&nbsp;" + monthName + "</div>";
         printContent += "<table class='" + tblClass + "'>" + makeGregorianCalendarContent(year, month) + "</table><br/>";
      }
   }
   $("iframe").get(0).contentDocument.querySelector("#container").innerHTML = printContent;
   $("iframe").get(0).contentWindow.print();
}