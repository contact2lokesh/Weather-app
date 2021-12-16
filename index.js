const countryList = document.getElementById("countrylist");
const stateList = document.getElementById("statelist");
const cityList = document.getElementById("citylist");
const weatherList = document.getElementById("weatherwidget");

const configUrl = {
    countryUrl: "https://api.countrystatecity.in/v1/countries",
    countryKey: "NGdDQ3dpZzZvQ2twY09ndjdwc29SMGNuelJRNUZreVo2MU9lakt1Sw==",
    weatherUrl: "https://api.openweathermap.org/data/2.5/",
    weatherKey: "7737eb981e2c9572ab3c2376b0f7de47",
}

//Country key in header 
var headers = new Headers();
headers.append("X-CSCAPI-KEY", "configUrl.countryKey");

var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
};

// Get Countries states and cities
const getCountriesList = async (name, ...args) => {
    let gettingApi;
    switch(name) {
      case "Countries" : gettingApi =  configUrl.countryUrl;
      break;
      case "states":
        gettingApi = `${configUrl.countryUrl}/${args[0]}/states`;
        break;
      case "cities":
        gettingApi = `${configUrl.countryUrl}/${args[0]}/states/${args[1]}/cities`;
      default:

    }
    const response = await fetch(gettingApi, { headers: { "X-CSCAPI-KEY": configUrl.countryKey } })
    // console.log(response);
    if (response.status != 200) {
        throw Error(`somthing went wrong, status code: ${response.status}`);
    }
    const countrydata = await response.json();
    // console.log(data);
    return countrydata;
};

// Get Weather Details
const getWeatherDetails = async(cityName, countryCode, units="metric")=>{
  const gettingWeatherApi = `${configUrl.weatherUrl}weather?q=${cityName},${countryCode.toLowerCase()}&APPID=${configUrl.weatherKey}&units=${units}`;
    
    const response = await fetch(gettingWeatherApi);
    //    console.log(gettingWeatherApi);
    if(response.status != 200){
        throw Error(`somthing went wrong, status code: ${response.status}`);
    } else{
        const weatherData = response.json();
        return weatherData;
    }
    
 }

 //get time
 const getDateTime = (Time) => {
    const milliSeconds = Time * 1000;
    const dateObject = new Date(milliSeconds);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
    return humanDateFormate;
  };

  const tempCard = (val, unit = "cel") => {
    const flag = unit == "far" ? "°F" : "°C";
    return `<div id="tempcard">
  <h6 class="card-subtitle mb2 ${unit}">${val.temp}</h6>
  <p class="card-text">Feels Like: ${val.temp} ${flag}</p>
  <p class="card-text">Max: ${val.temp_max} ${flag}, Min: ${val.temp_min} ${flag}</p>
  </div>`;
  };
 //Display Weather
 const displayWeather =(data)=>{
  const weatherWidget = `<div class="card">
  <div class="card-body">
        <h5 class="card-title">${data.name}, ${data.sys.country} <span class="float-end units">
        <a href="#" class="unitlink active" data-unit="cel">°C</a> | <a href="#" data-unit="far" class="unitlink">°F</a></span></h5>
        <p>${getDateTime(data.dt)}</p>
        <div id="tempcard">${tempCard(data.main)}</div>
  ${data.weather.map((w) => `<div id="img-container">${w.main} <img src="https://openweathermap.org/img/wn/${w.icon}.png" /></div>
  <p>${w.description}</p>`
    ).join("\n")}
</div>
</div>`;
weatherList.innerHTML = weatherWidget;
 };
 

// add countries in option tag 
document.addEventListener('DOMContentLoaded', async () => {
    let countries = await getCountriesList("Countries");
    // console.log(countries);
    let countriesOption = "";
    countriesOption = countriesOption + `<option value="">Select Country</option>`;
    if (countries) {
        countries.map((country) => {
            countriesOption = countriesOption + `<option value="${country.iso2}">${country.name}</option>`;
            // console.log(countriesOption);
        });
        countryList.innerHTML = countriesOption;
}
 // list states//
 countryList.addEventListener("change", async function(){
    const setcountryCode = this.value;
    // console.log(setcountryCode);
    const states = await getCountriesList("states", setcountryCode);
    // console.log(states);
    let stateOption = "";
    stateOptionn = stateOption + `<option value="">Select State</option>`;
    if (states) {
        states.map((state) => {
            stateOption = stateOption + `<option value="${state.iso2}">${state.name}</option>`;
            // console.log(countriesOption);
        });
        stateList.innerHTML = stateOption;
        stateList.disabled = false;
}

// list of cities
stateList.addEventListener("change", async function(){
    const setcountryCode = countryList.value;
    // console.log(setcountryCode);
    const setStateCode = this.value;
    // console.log(setStateCode);
    const cities =  await getCountriesList("cities", setcountryCode, setStateCode); 
    // console.log(cities);
    let citiesOption = "";
    citiesOption = citiesOption + `<option value="">Select City</option>`;
    if (cities) {
        cities.map((city) => {
            citiesOption = citiesOption + `<option value="${city.name}">${city.name}</option>`;
        });
        cityList.innerHTML = citiesOption;
        cityList.disabled = false;
    }
});
 // Select City
cityList.addEventListener("change", async function(){
    const setcountryCode = countryList.value;
    const setCitiesCode = this.value;
    // console.log(setCitiesCode);
    const weatherInformation = await getWeatherDetails(setCitiesCode, setcountryCode);
    // console.log(weatherInformation);
    displayWeather(weatherInformation);
});
//  change unit
  document.addEventListener("click", async(e)=>{
      if(e.target.classList.contains("unitlink")){
           const unitValue = e.target.getAttribute("data-unit");
           const setcountryCode = countryList.value;
           const setCitiesCode = cityList.value;
           const unitFlag = unitValue == "far" ? "imperial" : "metric";
           const weatherInformation = await getWeatherDetails(setCitiesCode, setcountryCode, unitFlag);
           const weatherTemp = tempCard(weatherInformation.main, unitValue);
           document.getElementById("tempcard").innerHTML = weatherTemp;
               //acvtive Unit
            document.querySelectorAll(".unitlink").forEach((link)=>{
                link.classList.remove("active");
                 });
                   e.target.classList.add("active");
      }
  });
  });
});




