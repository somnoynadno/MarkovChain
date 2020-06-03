'use strict'

const SLEEP_TIME = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


class MarkovChain {
  constructor() {
    this.matrix = [
      [-0.4,  0.3,  0.1],
      [ 0.4, -0.8,  0.4],
      [ 0.1,  0.4, -0.5]
    ];
    // честно рассчитал на листочке бумаги
    this.finalProbs = [56/240, 124/240, 60/240]
    this.isCanceled = true;

    // initial state
    this.state = 0;
    this.N = 0;

    // time controllers
    this.time = 0;
    this.changeTime = 2;
    this.timer = document.getElementById("time-span");

    // weather view
    this.weatherView =  document.getElementById("weather-img");

    // chart variables
    this.chart = new google.visualization.BarChart(document.getElementById('chart'));
    this.distributionData = [
      ['Weather', 'Probability'],
      ["Sunny", 0],
      ["Clouds", 0],
      ["Rainy", 0]
    ];
    this.options = {
      title: 'Visualtization',
      legend: { position: 'bottom' }
    };
  }

  start = async () => {
    if (!this.isCanceled) return;

    this.isCanceled = false;

    console.log("Started...")
    while (!this.isCanceled) {
      this._updateTime();
      this._debug();

      if (this.time > this.changeTime) {
        // декларативненько
        this._increaseChangeTime();
        this._changeState();

        this._updateWeatherView();
        this._updateDistributionData();

        this._drawChart();
      }

      await sleep(SLEEP_TIME);
    }
  }

  stop() {
    this.isCanceled = true;
    console.log("Canceled");
  }

  _debug() {
    console.log("Time: " + this.time);
    console.log("Change time: " + this.changeTime);
  }

  _changeState() {
    console.log("Changing state...");

    let r = Math.random();
    let acc = 0;

    for (let i = 0; i < 3; i++) {
      console.log('i = ' + i);
      if (i != this.state) {
        let v = -this.matrix[this.state][i] / this.matrix[this.state][this.state];
        acc += v;
        console.log(acc + " vs " + r);
        if (acc > r) {
          this.state = i;
          console.log("New state: " + this.state);
          break;
        }
      }
    }
  }

  _increaseChangeTime() {
    let t = Math.log(Math.random())/this.matrix[this.state][this.state];
    this.changeTime += Math.ceil(t);
    console.log("New change time: " + this.changeTime);
  }

  _updateTime() {
    this.time++;
    this.timer.innerHTML = (this.time % 24) + ":00";
  }

  _updateWeatherView() {
    switch (this.state) {
      case 0:
          this.weatherView.src = "static/img/sun.png";
        break;
      case 1:
          this.weatherView.src = "static/img/clouds.png";
        break;
      case 2:
          this.weatherView.src = "static/img/rain.png";
        break;
      default:
        alert("Fuck");
    }
  }

  _updateDistributionData() {
    this.distributionData[this.state + 1][1]++;
    this.N++;
  }

  _drawChart() {
    let data = [];
    // не спрашивайте
    for (let i = 0; i < this.distributionData.length; i++) {
      if (i > 0) data.push(Array.prototype.concat(this.distributionData[i][0], this.distributionData[i][1]/this.N, this.finalProbs[i-1]));
      else data.push(Array.prototype.concat(this.distributionData[i], ["Final"])); // labels
    }
    data = google.visualization.arrayToDataTable(data);

    this.chart.draw(data, this.options);
  }
}


document.addEventListener("DOMContentLoaded", () => {
    google.charts.load('current', {'packages':['corechart']});

    google.charts.setOnLoadCallback(() => {
      let MC = new MarkovChain();

      let start = document.getElementById("start-btn");
      let stop = document.getElementById("stop-btn");

      start.addEventListener('click', () => MC.start());
      stop.addEventListener('click', () => MC.stop());
    });
});
