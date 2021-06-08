import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Chartjs from 'chart.js/dist/chart';
import numeral from 'numeral';
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
      gradient = ctx.createLinearGradient(0, 0, 0, chartRef.current ? chartRef.current.height + 50 : 250);
      gradient.addColorStop(0, styles.backgroundColor ? styles.backgroundColor : '#883636');
      gradient.addColorStop(1, styles.backgroundColor ? `${styles.backgroundColor}00` : '#88363600');
    }
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
              return numeral(value).format('0.[0]a');
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
    setChartData(data);
    setChartLabel(labels);
    setStyle(styles);
    if (chartInstance) chartInstance.update();
    // eslint-disable-next-line
  }, [data, labels, chartInstance, styles]);


  const ctx = chartRef.current;
  if (ctx && !isRebuildChart && chartData.length > 0 && chartLabel.length > 0) {
    const chart = new Chartjs(ctx, configs);
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

SenChart.propTypes = {
  type: PropTypes.string,
  disableAxe: PropTypes.bool,
  data: PropTypes.array,
  styles: PropTypes.object,
}

export default SenChart;