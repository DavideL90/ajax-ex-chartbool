//array to store the list of name
var arrayNames = [];
//var to store the selected date
var dataToStore;
//chart line
var chartLine;
//pie chart
var myPieChart
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
      dataToStore = start.format('DD-MM-YYYY');
   });

   //call function to retrieve sales data.
   retrieveData();

   //on button click add the sales for that month
   $('button').click(function(){
      var vendor = $('#namesList').val();
      var saleAmount = parseFloat($('#salesInput').val());
      if((vendor != null) && (!isNaN(saleAmount))){
         $('#salesInput').val('');
         addData(vendor, saleAmount, dataToStore);
      }
      else{
         alert('uno o più valori inseriti risultano errati');
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
         findNames(data);
         //create a line chart with total sales per month
         //and return the annual sales amount
         var annualSales = createLineChart(data);
         createPieChart(data, annualSales);
      },
      error: function(){
         alert('Errore');
      }
   });
}

//function to create a line chart and return the annual sales amount
function createLineChart(infos){
   //var to store the annual amount of sales
   var salesYear = 0;
   //array to contains the amount of sales for every month
   var arrayOfSales = [];
   //make a loop through months
   for (var m = 0; m < 12; m++) {
      var totalSum = 0;
      for (var i = 0; i < infos.length; i++) {
         //create a moment obj
         var dateToCheck = moment(infos[i].date, 'DD, MM, YYYY');
         //check if the month of the obj is the same
         if(m == dateToCheck.month()){
            totalSum += parseFloat(infos[i].amount);
         }
      }
      salesYear += totalSum;
      arrayOfSales.push(totalSum);
   }
   var ctx = document.getElementById('myChart').getContext('2d');
   chartLine = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        datasets: [{
            label: "Andamento mensile delle vendite",
            borderColor: 'rgb(255, 99, 132)',
            data: arrayOfSales,
            pointBackgroundColor: '#ffedbc',
            pointBorderColor: '#d58bff',
            borderWidth: '2',
            radius: '5',
            // pointHoverRadius: '10'
        }]
    },

    // Configuration options go here
    options: {}
   });
   return salesYear;
}

//function to create the pie chart
function createPieChart(infos, totalSales){
   //array with the percentual amounts
   var arrayAmounts = [];
   //find percentage of every salesman's sale
   for (var x = 0; x < arrayNames.length; x++) {
      var totalAmount = 0;
      for (var i = 0; i < infos.length; i++) {
         //if the name is equal then sum the amount
         if(arrayNames[x] == infos[i].salesman){
            totalAmount += parseFloat(infos[i].amount);
         }
      }
      //find the percentage of the sales in the year
      var percentualAmount = parseFloat((totalAmount * 100 / totalSales).toFixed(2));
      arrayAmounts.push(percentualAmount);
   }
   //create pie chart
   var ctx = document.getElementById('myChart2').getContext('2d');
   myPieChart = new Chart(ctx,{
    type: 'pie',
    data: {
      labels: arrayNames,
      datasets: [{
         label: arrayNames,
         data: arrayAmounts,
         backgroundColor: ['#f2d8ff', '#7e1f2a', '#61d4fb', '#ffc371'],
      }]
   },
    options: {}
   });
}

//function to find the names of salesmen. Then fill the select
function findNames(infos){
   //make a loop to find all the names of the salesmen
   for (var i = 0; i < infos.length; i++) {
      // push the first name of the result inside the array
      if(i == 0){
         arrayNames.push(infos[i].salesman);
         $('#namesList').append('<option value="' + infos[i].salesman + '">' +  infos[i].salesman + '</option>');
      }
      else{
         //check if the name is already included otherwise add it
         if(!arrayNames.includes(infos[i].salesman)){
            arrayNames.push(infos[i].salesman);
            $('#namesList').append('<option value="' + infos[i].salesman + '">' +  infos[i].salesman + '</option>');
         }
      }
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
         retrieveData()
      },
      error: function(){
         alert('Errore');
      }
   });
}
