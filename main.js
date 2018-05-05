//var to store the selected date
var dataToStore;
//chart line
var chartLine;
//pie chart
var myPieChart;
//chart bar
var chartBar;

$(document).ready(function(){

   //generate a calendar to choose the date between year 2017
   $('#datePicker').daterangepicker({
      "singleDatePicker": true,
      "showDropdowns": true,
      "locale": {
         "format": "DD/MM/YYYY",
         "cancelLabel": 'Clear',
         "separator": "/"
      },
      "linkedCalendars": false,
      "startDate": "01/01/2017",
      "endDate": "31/12/2017",
      "minDate": "01/01/2017",
      "maxDate": "31/12/2017",
      "opens": "center"
   },
   function(start, end, label) {
      dataToStore = start.format('DD/MM/YYYY');
   });

   //call function to retrieve sales data.
   retrieveData();

   //on button click add the sales for that month
   $('button').click(function(){
      console.log(dataToStore);
      //take the values of the input elements
      var vendor = $('#namesList').val();
      var saleAmount = parseFloat($('#salesInput').val());
      //check if the input is made correctly
      if((vendor != null) && (!isNaN(saleAmount)) && (dataToStore != undefined)){
         $('#salesInput').val('');
         //call a function that makes an ajax call and add the input values
         addData(vendor, saleAmount, dataToStore);
      }
      else{
         alert('Uno o più valori inseriti risultano errati');
         $('#salesInput').val('');
      }
   });
});

//function to retrieve data from the API
function retrieveData(){
   $.ajax({
      url: 'http://138.68.64.12:3013/sales',
      method: 'GET',
      success: function(data){
         console.log(data);
         //find names of salesmen and fill the select
         var arrayNames = findNames(data);
         console.log(arrayNames);
         //create a line chart with total sales per month
         //and return the annual sales amount
         var annualSales = createLineChart(data);
         //create a pie chart passing the annual amount of sales as param
         createPieChart(data, annualSales, arrayNames);
         //create a bar chart to determine for every quarter how many sales took place
         createBarChart(data);
      },
      error: function(){
         alert('Errore');
      }
   });
}

//function to find the names of salesmen. Then fill the select
function findNames(infos){
   var arrayOfNames = [];
   //make a loop to find all the names of the salesmen
   for (var i = 0; i < infos.length; i++) {
      if(!arrayOfNames.includes(infos[i].salesman)){
         arrayOfNames.push(infos[i].salesman);
         $('#namesList').append('<option value="' + infos[i].salesman + '">' +  infos[i].salesman + '</option>');
      }
   }
   return arrayOfNames
}

//function to create a line chart and return the annual sales amount
function createLineChart(infos){
   //array of months
   var arrayMonths = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
   //var to store the annual amount of sales
   var salesYear = 0;
   //array to contains the amount of sales for every month
   var arrayOfSales = [];
   //make a loop through months
   for (var m = 0; m < 12; m++) {
      var totalSum = 0;
      //for every month calculate the amount of sales
      for (var i = 0; i < infos.length; i++) {
         //create a moment obj
         var dateToCheck = moment(infos[i].date, 'DD, MM, YYYY');
         //check if the month of the obj is the same
         if(m == dateToCheck.month()){
            totalSum += parseFloat(infos[i].amount);
         }
      }
      //after every month add the amount to find the amount of sales per year
      salesYear += totalSum;
      //push into the array the monthly amount
      arrayOfSales.push(totalSum);
   }
   //define an object for the line chart
   var chartDataObj = {
      label: "Andamento mensile delle vendite",
      borderColor: 'rgb(255, 99, 132)',
      data: arrayOfSales,
      pointBackgroundColor: '#ffedbc',
      pointBorderColor: '#d58bff',
      borderWidth: '2',
      radius: '5',
   };
   //pass the name of the canvas where the chart will be printed
   var nameOfCanvas = $('#myChart').attr('id');
   //call function to generate dinamically the chart
   generateCharts('line', chartDataObj, nameOfCanvas, arrayMonths);
   return salesYear;
}

//function to create the pie chart
function createPieChart(infos, totalSales, arrOfNames){
   //array with the percentual amounts
   var arrayAmounts = [];
   //find percentage of every salesman's sale
   for (var x = 0; x < arrOfNames.length; x++) {
      var totalAmount = 0;
      for (var i = 0; i < infos.length; i++) {
         //if the name is equal then sum the amount
         if(arrOfNames[x] == infos[i].salesman){
            totalAmount += parseFloat(infos[i].amount);
         }
      }
      //find the percentage of the sales in the year
      var percentualAmount = parseFloat((totalAmount * 100 / totalSales).toFixed(2));
      arrayAmounts.push(percentualAmount);
   }
   var chartDataObj = {
      label: arrOfNames,
      data: arrayAmounts,
      backgroundColor: ['#f2d8ff', '#7e1f2a', '#61d4fb', '#ffc371'],
   };
   var nameOfCanvas = $('#myChart2').attr('id');
   generateCharts('pie', chartDataObj, nameOfCanvas, arrOfNames);
}

// function to create a chart with bars
function createBarChart(infos){
   var arrOfQuarters = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Trimestre 4' ];
   var quarterArray = [];
   //set up a counter to store the number of sales for every quarter
   var counter = 0;
   for (var m = 0; m < 12; m++) {
      //for every month calculate the amount of sales
      for (var i = 0; i < infos.length; i++) {
         //create a moment obj
         var dateToCheck = moment(infos[i].date, 'DD, MM, YYYY');
         //check if the month of the obj is the same
         if(m == dateToCheck.month()){
            counter++;
         }
      }
      if(((m + 1) % 3) == 0){
         quarterArray.push(counter);
         counter = 0;
      }
   }
   var chartDataObj = {
      label: 'Numero vendite per trimestre',
      data: quarterArray,
      backgroundColor: ['#007a78', '#7e1f2a', '#61d4fb', '#ffc371'],
   };
   var nameOfCanvas = $('#myChart3').attr('id');
   var optionObj = {scales: {yAxes: [{ticks: {beginAtZero:true}}]}};
   generateCharts('bar', chartDataObj, nameOfCanvas, arrOfQuarters, optionObj);
}

//function which take the keyWord string to find which kind of chart to draw.
//the property object goes into the datasets array. It contains all the layout properties
//of the chart. NameOfChart contains the name of the canvas where I want to draw.
//The arrayLabels is an array useful to write the data into the chart
function generateCharts(keyWord, propertyObj ,nameOfChart, arrayLabels, optionToSet){
   var ctx = document.getElementById(nameOfChart).getContext('2d');
   var myNewChart = new Chart(ctx, {
      // The type of chart we want to create
      type: keyWord,
      // The data for our dataset
      data: {
         labels: arrayLabels,
         datasets: [propertyObj]
      },
      // Configuration options go here
      options: optionToSet
   });
   //check which keyword is, than pass the chart to a global variable
   if(keyWord == 'line'){
      chartLine = myNewChart;
   }
   else if(keyWord == 'pie'){
      myPieChart = myNewChart;
   }
   else{
      chartBar = myNewChart;
   }
}

//function to add a new sale
function addData(salesman, amountSold, dataToRegister){
   $.ajax({
      url: 'http://138.68.64.12:3013/sales',
      method: 'POST',
      data: {
         'salesman': salesman,
         'amount': amountSold,
         'date': dataToRegister
      },
      success: function(data){
         chartLine.destroy();
         myPieChart.destroy();
         chartBar.destroy();
         retrieveData()
      },
      error: function(){
         alert('Errore');
      }
   });
}
