import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import convertToFormat from '../../../utils/convertToFormat';

const areaChartOptions = {
    chart: {
        height: 450,
        type: 'area',
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    grid: {
        strokeDashArray: 0
    }
};

export default function AreaChart({ slot, data, labels }) {
    const [options, setOptions] = useState(areaChartOptions);
    console.log("data",data,slot);

    useEffect(() => {
        setOptions((prevState) => ({
            ...prevState,
            colors: ['#FFA500', '#FF8C00'], 
            xaxis: {
                categories: data.map((e) => {return  e.label}),
                labels: {
                    style: {
                        colors: Array(12).fill('#FF4500') 
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#FFD700' ,
                },
                tickAmount: slot === 'month' ? 11 : 7
            },
            yaxis: {
                labels: {
                    style: {
                        colors: ['#FF4500'] 
                    }
                }
            },
            grid: {
                borderColor: '#FFD700' 
            }
        }));
    }, [slot]);

    const [series, setSeries] = useState([
        {
            name: labels[0],
            data: data.map((e) => { return e.count1 })
        },
        {
            name: labels[1],
            data: data.map((e) => { return e.count2 })
        }
    ]);

    useEffect(() => {
        setSeries([
            {
                name: labels[0],
                data: data.map((e) => { return e.count1 })
            },
            {
                name: labels[1],
                data: data.map((e) => { return e.count2 })
            }
        ]);
    }, [slot, data]);

    return <ReactApexChart options={options} series={series} type="area" height={450} />;
}

AreaChart.propTypes = {
    slot: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired
};
