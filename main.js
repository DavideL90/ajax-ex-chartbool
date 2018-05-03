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
         console.log(data);
         //create a line chart with total sales per month
         //and return the annual sales amount
         var annualSales = createLineChart(data);
         console.log(annualSales);
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
   //array to store the list of name
   var arrayNames = [];
   //array with the percentual amounts
   var arrayAmounts = [];
   //make a loop to find all the names of the salesmen
   for (var i = 0; i < infos.length; i++) {
      // push the first name of the result inside the array
      if(i == 0){
         arrayNames.push(infos[i].salesman);
      }
      else{
         //check if the name is already included otherwise add it
         if(!arrayNames.includes(infos[i].salesman)){
            arrayNames.push(infos[i].salesman);
         }
      }
   }
   //find percentage of every salesman's sale
   for (var x = 0; x < arrayNames.length; x++) {
      var totalAmount = 0;
      for (var i = 0; i < infos.length; i++) {
         //if the name is equal then sum the amount
         if(arrayNames[x] == infos[i].salesman){
            totalAmount += infos[i].amount;
         }
      }
      //find the percentage of the sales in the year
      var percentualAmount = parseFloat((totalAmount * 100 / totalSales).toFixed(2));
      arrayAmounts.push(percentualAmount);
   }
   console.log(arrayAmounts);
   //create pie chart
   var ctx = document.getElementById('myChart2').getContext('2d');
   var myPieChart = new Chart(ctx,{
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
