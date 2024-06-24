import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ReactApexChart from 'react-apexcharts';


export default function MonthlyBarChart({ data }) {
    const barChartOptions = {
        chart: {
            type: 'bar',
            height: 365,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: data.map((e) => {return e.label}),
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                style: {
                    colors: ['#FF4500', '#FF4500', '#FF4500', '#FF4500', '#FF4500', '#FF4500', '#FF4500']  
                }
            }
        },
        yaxis: {
            show: false
        },
        grid: {
            show: false
        },
        colors: ['#FFA500'] 
    };
    const [series, setSeries] = useState([
        {
            data: data.map((e) => {return e.count})
        }
    ]);

    const [options, setOptions] = useState(barChartOptions);

    useEffect(() => {
         const weeklyData = [
            data?.num1 || 0,  
            data?.num2 || 0,  
            data?.num3 || 0,  
            data?.num4 || 0,  
            data?.num1 || 0,  
            data?.num2 || 0,  
            data?.num3 || 0   
        ];

        setSeries([
            {
                data: data.map((e) => {return e.count})
            }
        ]);
    }, [data]);

    return (
        <Box id="chart" sx={{ bgcolor: 'transparent' }}>
            <ReactApexChart options={options} series={series} type="bar" height={315} />
        </Box>
    );
}

MonthlyBarChart.propTypes = {
    data: PropTypes.object.isRequired
};
