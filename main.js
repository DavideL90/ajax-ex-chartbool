$(document).ready(function(){
   //call function to retrieve sales data.
   retrieveData();
});

//function to retrieve data from the API
function retrieveData(){
   $.ajax({
      url: 'http://138.68.64.12:3013/sales',
      method: 'GET',
      success: function(data){
         //create a line chart with total sales per month
         //and return the annual sales amount
         var annualSales = createLineChart(data);
         console.log(annualSales);
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
            totalSum += infos[i].amount;
         }
      }
      salesYear += totalSum;
      arrayOfSales.push(totalSum);
   }
   var ctx = document.getElementById('myChart').getContext('2d');
   var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        datasets: [{
            label: "Andamento mensile delle vendite",
            borderColor: 'rgb(255, 99, 132)',
            data: arrayOfSales,
        }]
    },

    // Configuration options go here
    options: {}
   });
   return salesYear;
}
