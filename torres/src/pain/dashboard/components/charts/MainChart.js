import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import HighchartsReact from 'highcharts-react-official'
// import Highcharts from 'highcharts';

import config from '../../../../config'

export default class RevenueChart extends PureComponent {
  static propTypes = {
    data: PropTypes.any.isRequired,
    isReceiving: PropTypes.bool
  };

  static defaultProps = {
    data: [],
    isReceiving: false
  };
  chartData = () => {
    let data = this.props.data.map(arr => {
      return arr.map(item => {
        return item[1]
      });
    });
    return {
      ...this.ticks,
      ...this.chartOptions,
      series: [
        {
          name: 'Light Blue',
          data: data[0],
          color: config.app.themeColors.primary,
          type: 'areaspline',
          fillOpacity: 0.2,
          lineWidth: 0
        },
        {
          type: 'spline',
          name: 'RNS App',
          data: data[1],
          color: config.app.themeColors.warning,
        },
        {
          type: 'spline',
          name: 'Sing App',
          data: data[2],
          color: config.app.themeColors.primary,
        }
      ]
    }
  }

  chartOptions = {
    credits: {
      enabled: false
    },
    chart: {
      height: 350,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    title: false,
    exporting: {
      enabled: false
    },
    legend: {
      verticalAlign: 'top',
      itemStyle: {
        color: "#000000"
      },
      itemHoverStyle: {
        color: "#020202"
      }
    },
    yAxis: {
      title: false,
      labels: {
        style: {
          color: "#000000"
        }
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {
        overflow: 'justify',
        style: {
          color: "#000000"
        }
      }
    },
    annotations: {
      visible: false
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle'
        },
        pointInterval: 3600000 * 25, // every day
        pointStart: Date.UTC(2018, 12, 19, 0, 0, 0),
        tooltip: {
          pointFormatter() {
            return `<span style="color: ${this.color}">${this.series.name} at ${this.y.toFixed(2)}</span>`;
          }
        }
      },
    }
  };
  ticks = ['Dec 19', 'Dec 25', 'Dec 31', 'Jan 10', 'Jan 14',
    'Jan 20', 'Jan 27', 'Jan 30', 'Feb 2', 'Feb 8', 'Feb 15',
    'Feb 22', 'Feb 28', 'Mar 7', 'Mar 17']

  render() {

    const { isReceiving } = this.props;

    return (
    <>
    </>
    );
  }
}
