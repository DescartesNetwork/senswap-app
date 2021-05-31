import React, { useEffect, useRef, useState } from 'react';
import PropType from 'prop-types';
import Chartjs from 'chart.js/dist/chart';

import Utils from 'helpers/utils';

function SenChart(props) {
  const { data, labels, type, disableAxe, styles, ...others } = props;
  const chartRef = useRef(null);
  const [chartLabel, setChartLabel] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [style, setStyle] = useState({});
  const [chartInstance, setChartInstance] = useState(null);
  const [isRebuildChart, setRebuildChart] = useState(false);

  const gradient = () => {
    let ctx
    let gradient;
    if (chartRef.current) {
      ctx = chartRef.current.getContext('2d');
      console.log(ctx, 'ctx');
      gradient = ctx.createLinearGradient(0, 0, 0, chartRef.current ? chartRef.current.height : 500);
      gradient.addColorStop(0, styles.backgroundColor ? styles.backgroundColor : '#883636');
      gradient.addColorStop(1, styles.backgroundColor ? `${styles.backgroundColor}00` : '#88363600');
    }
    console.log(gradient)
    return gradient;
  }

  const configs = {
    type: type,
    data: {
      labels: chartLabel || [],
      datasets: [{
        label: 'Volume 24h',
        backgroundColor: type === 'line' ? gradient(this) : style.backgroundColor,
        borderColor: style.borderColor,
        borderRadius: style.borderRadius,
        data: chartData || [],
        ...others,
      }],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: !disableAxe,
          grid: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return Utils.formatCurrency(value);
            }
          }
        },
        x: {
          display: !disableAxe,
          grid: {
            drawBorder: false,
            display: false,
          },
        },
      }
    }
  };

  useEffect(() => {
    console.log(data, data.length, 'data');
    setChartData(data);
    setChartLabel(labels);
    setStyle(styles);
    console.log(chartInstance)
    if (chartInstance) chartInstance.update();
    // eslint-disable-next-line
  }, [data, labels, chartInstance, styles]);


  const ctx = chartRef.current;
  if (ctx && !isRebuildChart && chartData.length > 0 && chartLabel.length > 0) {
    const chart = new Chartjs(ctx, configs);
    console.log('craete chart', configs)
    setChartInstance(chart);
    setRebuildChart(true);
  }

  return <canvas ref={chartRef} />
}

SenChart.defaultProps = {
  type: 'line',
  disableAxe: false,
  data: [],
  styles: {}
}
SenChart.propsType = {
  type: PropType.string,
  disableAxe: PropType.bool,
  data: PropType.array,
  styles: PropType.object,
}

export default SenChart;