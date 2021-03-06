var H = Highcharts
var cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsa'])
var states = Highcharts.geojson(Highcharts.maps['countries/us/states'])

var sheetID = '1PwHQog5axA1AigRdbavMUnItaPp3GOqneTNbYJnjP2E'
var range = 'Sheet3!A:BA'

var chart_title = 'Cost Burdens Rise with Age in Many Metros'
var legend_title = 'Households with<br/>Cost Burdens<br/>(Percent)'

var table_notes = 'Notes: Moderately (severely) cost-burdened households pay 30–50% (more than 50%) of income for housing. Households with zero or negative income are assumed to have severe burdens, while households paying no cash rent are assumed to be without burdens. <br/> Source: JCHS tabulations of US Census Bureau, 2006–2016 American Community Survey 1-Year Estimates using the Missouri Data Center MABLE/geocorr14.'

var export_filename = "Older Adult Housing Cost Burdens - Harvard JCHS - State of the Nation's Housing 2018"

var default_selection = 2

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {},
    drilldown_chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  //get Google sheet data
  $.get(H.JCHS.requestURL(sheetID, range))
  .fail(function(e) {console.error('$.get() failed to retrieve data')}) //throw an error if data doesn't load correctly
  .done(function(result) {
    categories = result.values[0]
    ref_data = result.values.slice(1)
    
    //create the title, notes, and search box
    $('#chart_title').html(chart_title)
    $('#table_notes').html(table_notes)
    
    H.JCHS.createSearchBox(ref_data, searchCallback, '', 1, 'search') //5th argument (the 1) tells the search box to list column index 1 from ref_data, instead of the default 0 (in this case metro name, not GEOID)

    //create the chart
    createChart() 

  }) 
}) //end document.ready


function createChart() {

  selected_data = ref_data.map(function (x) {
    return [x[0], x[default_selection]] //return data in 2 columns, GEOID and the value to be mapped

  })

  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
      drilldownFunction: drilldownChart
    },
    chart: {
      events: {
        load: function() {
          initUserInteraction()
        },
      },
    },

    legend: {
        title: {
          text: legend_title
        },
    },

    colorAxis: {
      dataClasses: [
        { to: 20 },
        { from: 20, to: 30 }, 
        { from: 30, to: 40 },
        { from: 40 }
      ]
    },
    series: [
      {
        type: 'map',
        name: categories[default_selection],
        mapData: cbsas,
        data: selected_data
      }, {
        type: 'mapline',
        name: 'State borders',
        data: states
      }
    ], //end series


    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        chart: {
          //marginBottom: 130 //may have to adjust to fit all of the notes
        },
        title: { text: chart_title },
        legend: { 
          //y: -45 //may have to adjust to fit all of the notes
        }
      }
    }, //end exporting
    
    tooltip: {
      formatter: function() {
        var point = this.point
        var series = this.series
        var user_selection = $('#user_input :checked').val()   
        
        var tooltip_text = ''
        tooltip_text +=  '<b>' +  point.name + '</b>'
        tooltip_text +=  '<br><i>' + series.name + '</i>'
        tooltip_text +=  '<br><br>Share of Households with Cost Burdens: <b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'

        ref_data.forEach(function (row) {
          if (row[0] == point.GEOID) {
            switch (user_selection) {
              case '2':
                tooltip_text += '<br>Share of Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[5], 1) + '%</b>'
                tooltip_text += '<br>Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[8]) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '3':
                tooltip_text += '<br>Share of Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[6], 1) + '%</b>'
                tooltip_text += '<br>Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[9]) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '4':
                tooltip_text += '<br>Share of Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[7], 1) + '%</b>'
                tooltip_text += '<br>Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[10]) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                break
            }
          }
        })

        tooltip_text += '<br><br><i>Click to see change over time...</i>'

        return tooltip_text

      }
    }
  } //end chart_options

  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.mapChart(
    'container',
    chart_options
  ) //end chart
  
} //end createChart()

/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function initUserInteraction () {
  $('#user_input').on('change', function () {
    var new_col = parseInt($('#user_input :checked').val())
    var new_data = ref_data.map(function (x) {
      return [x[0], x[new_col]]
    })
    chart.series[0].update({name: categories[new_col]})   
    chart.series[0].setData(new_data)
  })
}

function searchCallback (metro_name) {
  H.JCHS.mapLocatorCircle(chart, metro_name)
}

function drilldownChart(metro_name) {
  $('.JCHS-chart__modal').css('display','block')
  console.log(metro_name)
  
  var chart_data = []
  
  ref_data.forEach(function (el) {
    if (el[1] == metro_name) {
      switch ($('#user_input :checked').val()) {
        case '2':  
          chart_data = el.slice(17,28)
          break
        case '3':  
          chart_data = el.slice(28,39) 
          break
        case '4':  
          chart_data = el.slice(39,50) 
          break          
      } //end switch
    } //end if
  }) //end forEach

  var drilldown_options = {
    JCHS: {
      yAxis_title: 'Percent'
    },

    subtitle: {
      text: 
      'Share of Cost-Burdened Households Age ' + 
      $('#user_input :checked').parent('label').text().trim() + //text displayed next to radio button
      ' in ' + metro_name
    },


    yAxis: [{
      labels: {
        enabled: true,
        format: "{value}%"
      }
    }],

    xAxis: {
      categories: categories.slice(17, 28)
    },

    tooltip: {
      pointFormat: "<b>{point.y}</b>",
      valueDecimals: 0,
      valueSuffix: '%'
    },

    series: [
      {
        name: metro_name,
        data: chart_data,
        zones: [
          {
            value: 20,
            className: 'zone-0'
          },
          {
            value: 30,
            className: 'zone-1'
          },
          {
            value: 40,
            className: 'zone-2'
          },
          {
            className: 'zone-3'
          }
        ],
    }],
    
  }

  drilldown_chart = Highcharts.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  )

} //end drilldownChart()

