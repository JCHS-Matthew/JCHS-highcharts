var H = Highcharts

var sheetID = '1W_bH8i_kNrUzaW8nzoVG2kNd9ZcJ9ObBEsRKFPYb_LI'
var range = 'DataForInteractive'

var yAxis_title = 'Number of Rental Units'

var table_notes = 'Notes: Includes both vacant and occupied rental units but excludes those with no cash rent. Contract rents exclude utility costs paid separately. Rents are adjusted for inflation using the CPI-U for All Items Less Shelter. <br/> Source: <a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of US Census Bureau, American Community Survey 1-Year Estimates.'

var export_notes = 'Notes: Includes both vacant and occupied rental units but excludes those with no cash rent. Contract rents exclude utility costs paid separately. Rents are adjusted for inflation using the CPI-U for All Items Less Shelter. <br/> Source: JCHS tabulations of US Census Bureau, American Community Survey 1-Year Estimates.'

var default_selection = 'United States'

var categories = []
var ref_data = []
var chart = {}

H.JCHS.loadSheet(sheetID, range, function (obj) {
  categories = ['Under $600', '$600–999', '$1,000–1,399', '$1,400–$1,999', '$2,000 and Over']
  ref_data = obj.values.slice(1)

  createChart(default_selection)
  document.getElementById('table_notes').innerHTML = table_notes
  H.JCHS.createSearchBox(ref_data, createChart, '', 0, 'search', 'Select a state...')
})

function createChart (data_selection) {
  var selected_data = []

  ref_data.forEach(function (row) {
    if (row[0] === data_selection) {
      selected_data.push(
        { name: '2013', data: row.slice(2, 7), type: 'column' },
        { name: '2019', data: row.slice(7, 12), type: 'column' },
        { name: '2023', data: row.slice(12, 17), type: 'column' }
      )
    }
  })

  chart = H.chart('container', {
    JCHS: {
      yAxisTitle: yAxis_title,
      sheetID: sheetID,
      tableNotes: export_notes
    },

    chart: {
      events: {
        render: function () {
          H.JCHS.responsiveAnnotation(this, data_selection, 0, -275)
        }
      }
    },

    series: selected_data,

    xAxis: {
      title: { text: 'Real Contract Rent' },
      categories: categories
    },

    tooltip: {
      shared: false,
      formatter: function () {
        return this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 0) + '</b>'
      }
    },

    exporting: {
      filename: "Loss of Low-Cost Rentals – " + data_selection + " – Harvard JCHS State of the Nation's Housing 2025",
      JCHS: { sheetID: sheetID },
      chartOptions: {
        legend: { y: -30, x: 15 },
        title: { text: 'Loss of Low-Cost Rentals: ' + data_selection }
      },
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullDataset',
            'separator',
            'downloadPDF',
            'separator',
            'downloadPNG',
            'downloadJPEG'
          ]
        }
      }
    }
  })
}
