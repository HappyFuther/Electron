let $ = require("jquery");
require('bootstrap');

window.$ = window.jQuery = $;
var curNotyID = 0;
var notyList = [];

var months = ['ALAAM','OMEN','RAISA','MIA','UNA','RIPA','SPAA','AMIA','DAISA','RA','PIAA','TEMIAA'];
let gregMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CustomDate(year, month, day) {
  // Calculate the number of days since the start of the custom calendar
  var daysSinceStart = (year - 1) * 360 + (month - 1) * 30 + day;

  // Define the start of the Gregorian calendar (January 1, 1 AD)
  var gregorianStart = new Date(-13796, 9, 23);

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

   var gregorianStart = new Date(-13796, 9, 23);
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
   let today = new Date();
   for (i = 0; i < 3; i++) {
      content += "<tr>";
      for (j = 0; j < 10; j++) {
         newDate = new CustomDate(year, month, cusDay);
         let rDate = new Date(newDate.year, newDate.month - 1, newDate.day);
         let rDInfo = rDate.toLocaleDateString();
         content += "<td data_dateinfo='" + rDInfo + "'";
         if (rDInfo == today.toLocaleDateString()) {
            content += " class='today'";
         }
         content += ">";
         content += "<span>" + (cusDay++) + "</span>";
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
   
   let today = new Date();
   // Add cells for each day in the month
   oldMonth = 0;
   for (let i = 1; i <= daysInMonth; i++) {
      tmpDate = new ConvertGregianToCustom(year, month, i);
      let rDate = new Date(year, month - 1, i);
      let rDInfo = rDate.toLocaleDateString();
      calendar += "<td data_dateinfo='" + rDInfo + "'";
      if (rDInfo == today.toLocaleDateString()) {
         calendar += " class='today'";
      }
      calendar += ">";
      if (oldMonth != tmpDate.month) {
         oldMonth = tmpDate.month;
         calendar += "<span>" + i + "</span><br><span class='text-danger'> "+(months[tmpDate.month-1]+" "+tmpDate.day)+"</span></td>";
      } else {
         calendar += "<span>" + i + "</span><br><span class='text-danger'> "+tmpDate.day+"</span></td>";
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
   
   $("#customCalendar td").off("click");
   $("#customCalendar td").on("click", function(e) {
      if ($(this).text()=="") return;
      var myModal = new bootstrap.Modal(document.getElementById('notyModal'), {
         keyboard: true, focus: true
      });
      
      showFlag = $("#custRadio").get(0).checked;
      if (showFlag) {
         var year = $("#cusYear").val() * 1;
         var month = $("#cusMonth").val() * 1;
         var day = $(this).children("span").get(0).innerText * 1;
         gDate = new CustomDate(year, month, day);
         notiDate = new Date();
         notiDate.setFullYear(gDate.year);
         notiDate.setMonth(gDate.month - 1);
         notiDate.setDate(gDate.day);
         $("#noti_date").val(notiDate.toLocaleDateString("sv-SE"));
         notiDate.setSeconds(0);
         $("#noti_time").val(notiDate.toLocaleTimeString("sv-SE"));
      } else {
         var year = $("#gregYear").val() * 1;
         var month = $("#gregMonth").val() * 1;
         var day = $(this).children("span").get(0).innerText;
         notiDate = new Date();
         notiDate.setFullYear(year);
         notiDate.setMonth(month - 1);
         notiDate.setDate(day);
         $("#noti_date").val(notiDate.toLocaleDateString("sv-SE"));
         notiDate.setSeconds(0);
         $("#noti_time").val(notiDate.toLocaleTimeString("sv-SE"));
      }
      curNotyID = 0;
      $("#noty_title").val("");
      $("#btnRadioEvent").get(0).checked = true;
      $("#noti_desc").val("");
      myModal.toggle();
   });
   markNotyDates();
}

$('#cusYear').on("change", function(e) {
   // e.stopImmediatePropagation();
   y = $("#cusYear").val();
   m = $("#cusMonth").val();
   newDate = new CustomDate(y, m, 1);
   $("#gregYear").val(newDate.year);
   $("#gregMonth").val(newDate.month);
   updateContent();
});

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

$(document).ready(() => {
   let nowDate = new Date();
   custDate = new ConvertGregianToCustom(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
   $("#cusYear").val(custDate.year);
   $("#cusMonth").val(custDate.month);
   gregDate = new CustomDate(custDate.year, custDate.month, 1);
   $("#gregYear").val(gregDate.year);
   $("#gregMonth").val(gregDate.month);
   updateContent();
   
   $('#saveNoty').on("click", function(e) {
      //save noty and mark date!
      let notyType = 0;
      if($("#btnRadioTask").get(0).checked) notyType = 1;
      if($("#btnRadioReminder").get(0).checked) notyType = 2;
      data = {"id": curNotyID, "title": $("#noty_title").val(), "type": notyType, "date": $("#noti_date").val(), "time": $("#noti_time").val(), "desc": $("#noti_desc").val()};
      if (data.title == "") {
         $("#noty_title").focus();
         return;
      }
      if (data.date == "") {
         $("#noti_date").focus();
         return;
      }
      if (data.time == "") {
         $("#noti_time").focus();
         return;
      }
      ipcRenderer.send('registerNotyInfo', data);
      $("#noty_title").val("");
      $("#noti_desc").val("");
      curNotyID = 0;
   });

   $("#questionModal button.btn-primary").on("click", function(e) {
      e.preventDefault();
      notyId = $("#questionModal button.btn-primary").attr("notyId");
      ipcRenderer.send('removeNotyInfo', {id:notyId});
      qModal.hide();
   });
   
   loadNotyList();
});
      
ipcRenderer.on('registerNotyInfo', (event, result) => {
   var eTrStr = getNotyRowString(result);
   var existState = $("tr[data_id='" + result.id + "']").length;
   if (existState) {
      $("tr[data_id='" + result.id + "']").replaceWith(eTrStr);
   } else {
      $("#notybody").append(eTrStr);
   }
   defineListButtonEvent();
   resetNotyList();
});

ipcRenderer.on('removeNotyInfo', (event, result) => {
   $("tr[data_id='" + notyId + "']").remove();
   resetNotyList();
});

ipcRenderer.on('getNotyList', (event, result) => {
   $("#notybody").empty();
   if (result) {
      for (var i=0; i<result.length; i++) {
         var eTrStr = getNotyRowString(result[i]);
         $("#notybody").append(eTrStr);
      }
      defineListButtonEvent();
      resetNotyList();
   }
});

ipcRenderer.on('getOneNotyInfo', (event, result) => {
   if (result) {
      curNotyID = result.id;
      $("#noty_title").val(result.notytitle);
      $("#noti_desc").val(result.notydesc);
      if (result.notytype == 0) {
         $("#btnRadioEvent").get(0).checked = true;
      } else if (result.notytype == 1) {
         $("#btnRadioTask").get(0).checked = true;
      } else {
         $("#btnRadioReminder").get(0).checked = true;
      }
      $("#noti_date").val(result.notydate);
      $("#noti_time").val(result.notytime);
   }
});

function loadNotyList() {
   ipcRenderer.send('getNotyList');
}

var qModal = new bootstrap.Modal(document.getElementById('questionModal'), {focus: true});

function removeNoty(notyId) {
   $("#questionModal button.btn-primary").attr({"notyId": notyId});
   qModal.show();
}

function setOneNotyInfo(notyId) {
   ipcRenderer.send('getOneNotyInfo', {id:notyId});
}

function getNotyRowString(row) {
   var nDate = new Date(row.notydate + " " + row.notytime);
   var nDay = nDate.toLocaleString();
   eTrStr = "<tr data_id='"+row.id+"'><td>";
   if (row.notytype == 0) {
      eTrStr+= "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><path fill='currentColor' d='M14.5 18q-1.05 0-1.775-.725T12 15.5q0-1.05.725-1.775T14.5 13q1.05 0 1.775.725T17 15.5q0 1.05-.725 1.775T14.5 18ZM5 22q-.825 0-1.413-.588T3 20V6q0-.825.588-1.413T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.588 1.413T19 22H5Zm0-2h14V10H5v10ZM5 8h14V6H5v2Zm0 0V6v2Z'/></svg>";
   } else if (row.notytype == 1) {
      eTrStr+= "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><path fill='currentColor' d='M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q1.625 0 3.075.475T17.75 3.8L16.3 5.275q-.95-.6-2.025-.938T12 4Q8.675 4 6.337 6.337T4 12q0 3.325 2.337 5.663T12 20q3.325 0 5.663-2.337T20 12q0-.45-.05-.9t-.15-.875L21.425 8.6q.275.8.425 1.65T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm-1.4-5.4l-4.25-4.25l1.4-1.4l2.85 2.85l10-10.025l1.4 1.4L10.6 16.6Z'/></svg>";
   } else {
      eTrStr+= "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 64 64'><path fill='currentColor' d='M52 18.719C52 1.131 34.117 2.055 34.117 2.055l.091.013A35.204 35.204 0 0 0 32.102 2h-.016s-.962.001-2.396.104C28.556 2.067 12 1.829 12 18.815c0 7.552 5.762 16.579 12.332 24.424c-4.788 4.521-8.453 7.528-8.453 7.528l4.896 11.139s5.101-4.183 11.178-10.325C38.072 57.776 43.225 62 43.225 62l4.898-11.137s-3.712-3.041-8.549-7.605C46.184 35.386 52 26.309 52 18.719m-6.325-3.067c-2.005 6.232-7.784 13.593-13.733 19.962c-6.045-6.47-11.909-13.951-13.82-20.232c2.222-2.727 7.498-4.649 13.67-4.649c6.373 0 11.798 2.049 13.883 4.919'/></svg>";
   }
   eTrStr+= "</td><td style='text-align:left;'><div style='width: 140px;word-wrap: break-word;'>"+row.notytitle+"</div></td>";
   eTrStr+= "<td style='text-align:left;'>"+nDay+"</td>";
   eTrStr+= "<td><svg class='editSvg' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><g fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'><path d='m16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621Z' /><path d='M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3' /></g></svg></td><td><svg class='removeSvg' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><path fill='currentColor' d='M7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7ZM17 6H7v13h10V6ZM9 17h2V8H9v9Zm4 0h2V8h-2v9ZM7 6v13V6Z' /></svg></td></tr>";
   return eTrStr;
}

function defineListButtonEvent() {
   $("#notybody svg.editSvg").off("click");
   $("#notybody svg.editSvg").on("click", function(e) {
      var notyId = $(this).parent().parent().attr("data_id");
      setOneNotyInfo(notyId);
   });
   $("#notybody svg.removeSvg").off("click");
   $("#notybody svg.removeSvg").on("click", function(e) {
      var notyId = $(this).parent().parent().attr("data_id");
      removeNoty(notyId);
   });
}

function resetNotyList() {
   notyList = [];
   $("#notybody tr").each(function() {
      var dateInfo = $(this).children("td:nth-child(3)").text();
      var date = new Date(dateInfo);
      dateInfo = date.toLocaleDateString();
      if (notyList.indexOf(dateInfo) == -1)
         notyList.push(dateInfo);
   });
   markNotyDates();
}

function markNotyDates() {
   $("#customCalendar td").removeClass("notydate");
   for (var i=0; i<notyList.length; i++) {
      $("td[data_dateinfo='" + notyList[i] + "']").addClass("notydate");
   }
}