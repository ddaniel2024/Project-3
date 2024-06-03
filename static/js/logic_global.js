//Function to build charts
function buildCharts() {
    d3.json("output/data.json").then(function(data) {

        //Retrieve data from json
        let emissionData = data.emissions;
        let GDPData = data.gdp;
        let populationData = data.population;
        let countryData = data.countries

        let selectedBubbleYear = d3.select("#sel-bubble-year").property("value");
        let selectedBarYear = d3.select("#sel-bar-year").property("value");
        let selectedBarEmission = d3.select("#sel-bar-emission").property("value");

        //Bubble Chart
        //Establish  arrays for continents and colors
        let continents = ["Asia", "Africa", "Europe", "North America", "South America", "Oceania"];
        let colors = ["#fe797b", "#36cedc", "#ffea56", "#3e9c16", "#8fe968", "#a587ca"];

        //Establish empty array for trace data
        let bubbleTraceData = [];

        //For loop to loop through the continents array
        for (let i=0; i<continents.length; i++) {

            //Function to find the continent of a given row of data
            function getContinent(row) {
                return (row.Continent == continents[i]);
            };

            //Establish empty arrays to populate with data for the bubble plot 
            let GDPs = [];
            let populations = [];
            let countries = [];
            let emissions = [];

            //Filter the JSON data with the getContinent function to get only the data where the continent matches the one in the current loop
            let countryGDP = GDPData.filter(getContinent);
            let countryPopulation = populationData.filter(getContinent);
            let countryName = countryData.filter(getContinent);

            //2nd For loop to gather the GDP and population data, and push into the empty arrays
            for (let i=0; i<countryName.length; i++) {
                GDPs.push(countryGDP[i][selectedBubbleYear]);
                populations.push(countryPopulation[i][`${selectedBubbleYear} Population`]);

                let country = countryName[i].Country;
                countries.push(country);

                //Function to get the row of emission data that matches the given country and year
                function getEmissionsRow(row) {
                    return ((row.Country == country) & (row.Year == selectedBubbleYear));
                };

                let bubbleEmissionsRow = emissionData.filter(getEmissionsRow); 

                //3rd For loop to gather the emissions data
                for (let i=0; i<bubbleEmissionsRow.length; i++) {
                    emissions.push((bubbleEmissionsRow[i].Total)**(1/1.8));
                };
            };

            //Generate a trace for the bubble chart, with emission as marker size
            let bubbleTrace = {
                x : populations,
                y : GDPs,
                type : "scatter",
                mode : "markers",
                marker : {
                    size : emissions,
                    //The marker color corresponds to the continent
                    color : colors[i]
                },
                hovertemplate : "<i>%{text}</i>" +
                            "<br>" +
                            "Population: %{x}" +
                            "<br>" +
                            "GDP: %{y}",
                text : countries,
                name : continents[i]
            };

            //The trace is pushed into the empty trace data array, and the loop repeats for the next continent
            bubbleTraceData.push(bubbleTrace);
        };

        let bubbleLayout = {
                xaxis : {
                    title : "Population",
                },
                yaxis : {
                    title : "GDP ($)"
                },
                legend : {
                    showlegend : true,
                    //Itemizing ensures that the legend symbols don't change size
                    itemsizing : "constant"
                }
        };
        
        let bubbleConfig = {responsive: true};

        Plotly.newPlot("bubble-plot", bubbleTraceData, bubbleLayout, bubbleConfig);

        //Barplot
        //Use a function to find the rows of data that match the selected year
        function findYear(row) {
        return (row.Year == selectedBarYear)
        };

        //Filter, sort, and slice the data to obtain a "Top 10" array
        let emissionsRow = emissionData.filter(findYear);

        let sortedEmissionsRow = emissionsRow.sort((a,b) => b[selectedBarEmission] - a[selectedBarEmission]);

        let sliedEmissionsRow = sortedEmissionsRow.slice(0,10);

        //Clear selected section of any previous data
        d3.select("#bar").html("");

        //Generate barplot
        //Conditional: if there is no data available, an error message is displayed; if not, the data is displayed
        if (sliedEmissionsRow == 0) {

            bar.innerHTML = "Data Unavailable";

        }
        else {
            //Generate bar chart                    
            let barTrace = {
                x : sliedEmissionsRow.map(object => object.Country),
                y : sliedEmissionsRow.map(object => object[selectedBarEmission]),
                type : "bar",
                marker : {
                    color : "#fe797b"
                }
            };
            
            let barTraceData = [barTrace];

            let barLayout = {
                title : `Top 10 ${selectedBarEmission} Emissions in ${selectedBarYear}`,
                yaxis : {
                    title : "MtCO<sub>2</sub>"
                },
            };

            Plotly.newPlot("bar", barTraceData, barLayout);
        }

    });
}

//Function to initialise dashboard
function init() {
    d3.json("output/data.json").then(function(data) {
        //Appened options for bubbleplot years
        bubbleYears = [1970, 1980, 1990, 2000, 2010, 2020];

        let bubbleYearDropdown = d3.select("#sel-bubble-year");
        
        for (let i=0; i<bubbleYears.length; i++) {
            bubbleYearDropdown.append("option").text(bubbleYears[i]);
        };

        let selectedBubbleYear = bubbleYearDropdown.property("value");

        //Appened options for barplot emissions
        barEmissions = ["Cement", "Coal", "Flaring", "Gas", "Oil", "Other", "Total"];

        let barEmissionDropdown = d3.select("#sel-bar-emission");

        for (let i=0; i<barEmissions.length; i++) {
            barEmissionDropdown.append("option").text(barEmissions[i]);
        };

        let selectedBarEmission = barEmissionDropdown.property("value");

        //Appened options for barplot years
        years = []

        for (let i=1921; i<=2021; i++) {
            years.push([i]);
        };

        let barYearDropdown = d3.select("#sel-bar-year");

        for (let i=0; i<years.length; i++) {
            barYearDropdown.append("option").text(years[i]);
        };

        let selectedBarYear = barYearDropdown.property("value");

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