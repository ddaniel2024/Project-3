//Function to build charts
function buildCharts() {
    d3.json("output/data.json").then(function(data) {

        //Retrieve data from json
        let emissionData = data.emissions;

        let selectedCountry = d3.select("#sel-global-country").property("value");
        let selectedYear = d3.select("#sel-global-year").property("value");     

        //Line Graph
        //Use a function to find the rows of data that match the selected country
        function findCountry(row) {
        return (row.Country == selectedCountry)
        };

        let lineDataArray = emissionData.filter(findCountry);

        //Generate line graph
        //Establish  arrays for emission types and colors
        let emissionTypes = ["Cement", "Coal", "Flaring", "Gas", "Oil", "Other", "Total"];
        let colors = ["#ffea56", "#36cedc", "#a587ca", "#8fe968", "#fe797b", "#ffb750", "#000000"];  

        //Establish empty array for trace data
        let lineTraceData = []

        //For loop to loop through the emissions array
        for (let i=0; i<emissionTypes.length; i++) {
            

            //Generate a trace for the line chart
            let lineTrace = {
                x : lineDataArray.map(object => object.Year),
                y : lineDataArray.map(object => object[emissionTypes[i]]),
                type : "scatter",
                mode : "line",
                line: {
                    //The line color corresponds to the emission type
                    color: colors[i]
                },
                name: emissionTypes[i],
            };

            //The trace is pushed into the empty trace data array, and the loop repeats for the next emission type
            lineTraceData.push(lineTrace);
        }

        let lineLayout = {
            title : "Emissions Over The Last 100 Years",
            xaxis : {
                title : "Year"
            },
            yaxis : {
                title : "Emissions (MTCO<sub>2</sub>)"
            }
        };

        let lineConfig = {responsive: true};

        Plotly.newPlot("line", lineTraceData, lineLayout, lineConfig);

        //Pie Chart
        //Establish an array for emission types (labels), and an blank array for the data
        pieLabels = ["Cement", "Coal", "Flaring", "Gas", "Oil", "Other"]
        pieData = []

        //Populate the blank array with a "for" loop
        for (let i=0; i<emissionData.length; i++) {
            if (emissionData[i].Country == selectedCountry & emissionData[i].Year == selectedYear) {
                pieData.push(emissionData[i].Total);
                pieData.push(emissionData[i].Cement);
                pieData.push(emissionData[i].Coal);
                pieData.push(emissionData[i].Flaring);
                pieData.push(emissionData[i].Gas);
                pieData.push(emissionData[i].Oil);
                pieData.push(emissionData[i].Other);
            }
        };

        //Clear selected section of any previous data
        d3.select("#pie").html("");

        //Conditional: if there is no data availalbe, an error message is displayed; if not, the data is displayed
        if (pieData[0] == undefined | pieData[0] == 0) {
            
            pie.innerHTML = "Data Unavailable";

            //Error message is also displayed on the emissions info panel
            d3.select("#emissions-panel-info").text("N/A");
        }
        else {
            //Generate pie chart
            let pieTrace = {
            values : pieData.slice(1,6),
            labels : pieLabels,
            type : "pie",
            hole: 0.4,
            marker: {
                colors: ["#ffea56", "#36cedc", "#a587ca", "#8fe968", "#fe797b", "#ffb750"]
            }
            };

            let pieTraceData = [pieTrace];

            let pieLayout = {
                title : `Emissions breakdown for ${selectedCountry}, ${selectedYear} (MTCO<sub>2</sub>)`,
                legend : {
                    itemsizing : "constant"
                }
            };

            Plotly.newPlot("pie", pieTraceData, pieLayout);

            //Data is also displayed on the emissions info panel
            d3.select("#emissions-panel-info").text(pieData[0]);
        }
    });
}

//Function to initialise dashboard
function init() {
    d3.json("output/data.json").then(function(data) {

        //Appened options for country-focused dropdown (country)
        let countries = data.countries;

        let countryDropdown = d3.select("#sel-global-country");

        for (let i=0; i<countries.length; i++) {
            countryDropdown.append("option").text(countries[i].Country);
        };

        let selectedCountry = countryDropdown.property("value");

        //Appened options for country-focused dropdown (years)
        years = []

        for (let i=1921; i<=2021; i++) {
            years.push([i]);
        };

        let yearDropdown = d3.select("#sel-global-year");

        for (let i=0; i<years.length; i++) {
            yearDropdown.append("option").text(years[i]);
        };

        let selectedYear = yearDropdown.property("value");

        buildCharts();
    });
}

//Function on option change
function optionChanged() {
    d3.json("output/data.json").then(function(data) {

        buildCharts();
    });
}

//Initialise dashboard
init();