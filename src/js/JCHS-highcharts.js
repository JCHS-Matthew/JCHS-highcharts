import Highcharts from 'highcharts'
import '../css/JCHS-highcharts.css'

;(function (H) {

  var JCHS = {

    logoURL: 'https://www.jchs.harvard.edu/sites/default/files/harvard_jchs_logo_2017.png',

    standardOptions: {
      lang: {
        thousandsSep: ',',
        contextButtonTitle: 'Export Chart',
        downloadPDF: 'Download as PDF',
        downloadCSV: 'Download chart data (CSV)',
        downloadXLS: 'Download chart data (Excel)'
      },

      chart: {
        styledMode: true,
        spacing: [5, 5, 5, 5],
        marginTop: 40
      },

      title: { text: null },

      subtitle: { text: null },

      yAxis: {
        title: { text: null },
        labels: { format: '{value:,.0f}' },
        reversedStacks: false
      },

      credits: { enabled: false },

      tooltip: {
        enabled: true,
        useHTML: true,
        shared: true,
        outside: true,
        shape: 'rect'
      },

      plotOptions: {
        series: {
          connectNulls: true
        },
        spline: {
          marker: {
            enabled: false
          }
        }
      },

      exporting: {

        enabled: true,

        filename: 'Chart - Harvard Joint Center for Housing Studies',

        chartOptions: {

          chart: {
            spacingTop: 12,
            marginTop: 50,
            marginBottom: 130
          },

          title: {
            y: 8
          },

          subtitle: {
            widthAdjust: -170,
            x: 170,
            y: -28,
            align: 'left',
            verticalAlign: 'bottom'
          },

          series: { borderWidth: 0.5 },

          legend: { y: -45 }

        },

        menuItemDefinitions: {
          viewFullDataset: {
            text: 'View full dataset'
          }
        },

        buttons: {
          contextButton: {
            text: 'Export',
            menuItems: [
              'viewFullDataset',
              'separator',
              'printChart',
              'downloadPDF',
              'separator',
              'downloadPNG',
              'downloadJPEG',
              'separator',
              'downloadXLS'
            ]
          }
        }

      },

      navigation: {
        buttonOptions: {
          theme: { padding: 3 }
        }
      }
    },

    drilldownOptions: {

      chart: {
        margin: undefined,
        marginTop: undefined,
        marginBottom: 40,
        marginLeft: 50,
        marginRight: 10
      },

      plotOptions: {
        series: {
          label: { enabled: false }
        }
      },

      legend: { enabled: false },

      mapNavigation: { enabled: false },

      exporting: { enabled: false }

    },

    mapOptions: {

      chart: {
        margin: [10, 5, 10, 5],
        marginTop: 10,
        marginBottom: 10
      },

      plotOptions: {
        map: {
          allAreas: false,
          allowPointSelect: true,
          joinBy: ['GEOID', 0],
          keys: ['GEOID', 'value']
        },

        mapline: { enableMouseTracking: false }
      },

      colorAxis: {
        dataClassColor: 'category'
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'bottom',
        x: 10,
        padding: 5,
        labelFormatter: function () {
          if (!this.hasOwnProperty('from')) {
            return 'Under ' + this.to
          } else if (!this.hasOwnProperty('to')) {
            return this.from + ' or Over'
          } else {
            return this.from + ' – ' + this.to
          }
        }
      },

      mapNavigation: {
        enabled: true
      },

      exporting: {
        buttons: {
          contextButton: {
            text: 'Export',
            menuItems: [
              'viewFullDataset',
              'separator',
              'printChart'
            ]
          }
        }
      }
    }
  }


  JCHS.createSearchBox = function (
    data,
    callback,
    chart_slug,
    col_index,
    type,
    placeholder) {

    JCHS.createSearchBoxes(1, ...arguments)

  }


  JCHS.createSearchBoxes = function (
    number_of_boxes,
    data,
    callback,
    chart_slug = '',
    col_index = 0,
    type = 'dropdown',
    placeholder = 'default') {

    if (type === 'search' && placeholder === 'default') { placeholder = 'Search for metro...' }
    if (placeholder === 'default') { placeholder = 'Select a metro...' }

    number_of_boxes = Math.min(number_of_boxes, 8)

    if (chart_slug !== '' && chart_slug.charAt(0) !== '_') { chart_slug = '_' + chart_slug }

    var counter = 0
    while (counter < number_of_boxes) {
      (function (i) {

        var container = document.getElementById('search_box' + chart_slug)

        var input = document.createElement('input')
        input.id = 'search_input' + chart_slug + '_' + i
        input.className = 'JCHS-chart__search-box__input'
        input.autocomplete = 'off'

        if (Array.isArray(placeholder)) {
          input.placeholder = placeholder[i]
        } else {
          input.placeholder = placeholder
        }

        if (type !== 'dropdown') { input.style.backgroundImage = 'none' }

        container.appendChild(input)

        var list = document.createElement('ul')
        list.id = 'search_list' + chart_slug + '_' + i
        list.className = 'JCHS-chart__search-box__list'
        container.appendChild(list)

        var dedup_data = []
        data.forEach(function (el) {
          if (dedup_data.indexOf(el[col_index]) < 0) {
            dedup_data.push(el[col_index])
          }
        })

        dedup_data.forEach(function (el) {
          var li = document.createElement('li')
          li.textContent = el
          list.appendChild(li)
        })

        input.addEventListener('focus', function () {
          list.style.display = 'block'
        })

        input.addEventListener('keyup', function () {
          var filter = input.value.toUpperCase()
          var items = list.querySelectorAll('li')
          items.forEach(function (li) {
            if (li.textContent.toUpperCase().indexOf(filter) > -1) {
              li.style.display = 'block'
            } else {
              li.style.display = 'none'
            }
          })
        })

        input.addEventListener('change', function () {
          var params = []
          var allInputs = document.querySelectorAll('.JCHS-chart__search-box__input')
          allInputs.forEach(function (inp) {
            params.push(inp.value)
          })
          callback.apply(null, params)
          input.blur()
          list.style.display = 'none'
        })

        input.addEventListener('blur', function () {
          list.style.display = 'none'
        })

        list.addEventListener('mousedown', function (e) {
          if (e.target.tagName === 'LI') {
            input.value = e.target.textContent
            var evt = new Event('change')
            input.dispatchEvent(evt)
          }
        })

      })(counter)

      counter++
    }
  }


  JCHS.yAxisTitle = function (chart, yAxis_title, yAxis2_title) {
    chart.renderer
      .text(yAxis_title)
      .addClass('highcharts-axis-title')
      .align({ y: -5 }, false, 'plotBox')
      .add()

    if (typeof yAxis2_title === 'string') {
      var yAxis2 = chart.renderer
        .text(yAxis2_title)
        .addClass('highcharts-axis-title')
        .align({ align: 'right', y: -5 }, false, 'plotBox')
        .add()
      var box = yAxis2.getBBox()
      yAxis2.translate(-box.width, 0)
    }
  }


  JCHS.responsiveAnnotation = function (chart,
    text,
    x = 0,
    y = -20,
    verticalAlign = 'bottom',
    align = 'center') {

    var existing = document.querySelectorAll('.JCHS-chart__text-annotation')
    existing.forEach(function (el) {
      if (el.innerHTML.search(text) > -1) {
        el.remove()
      }
    })

    var rendered_text = chart.renderer
      .text(text)
      .addClass('JCHS-chart__text-annotation')
      .align({ align: align, verticalAlign: verticalAlign, x: x, y: y }, false, 'plotBox')
      .add()

    var box = rendered_text.getBBox()
    switch (align) {
      case 'center':
        rendered_text.translate(-box.width / 2, 0)
        break
      case 'right':
        rendered_text.translate(-box.width, 0)
        break
    }

  }


  JCHS.mapLocatorCircle = function (map_obj, search_value) {
    map_obj.series[0].points.forEach(function (el, idx) {
      if (el.name == search_value) {
        map_obj.series[0].points[idx].select(true)

        map_obj.renderer
          .circle(
            map_obj.series[0].points[idx].plotX,
            map_obj.series[0].points[idx].plotY + map_obj.margin[0],
            150
          )
          .attr({
            fill: 'transparent',
            stroke: 'black',
            'stroke-width': 1
          })
          .animate({
            r: 0
          })
          .add()
          .toFront()

        setTimeout(function () { map_obj.series[0].points[idx].select(false) }, 700)
      }
    })
  }


  JCHS.requestURL = function (sheetID, range) {
    range = range || 'Sheet1'
    var baseURL = 'https://sheets.googleapis.com/v4/spreadsheets/'
    var API_Key = 'AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ'
    var API_params = 'valueRenderOption=UNFORMATTED_VALUE'
    return baseURL + sheetID + '/values/' + range + '?key=' + API_Key + '&' + API_params
  }


  JCHS.loadSheet = function (sheetID, range, callback) {
    fetch(JCHS.requestURL(sheetID, range))
      .then(function (r) { return r.json() })
      .then(function (obj) { callback(obj) })
      .catch(function (e) { console.error('JCHS.loadSheet error:', e) })
  }


  JCHS.addTableNotes = function (chart, user_input_note) {

    var chart_options_note
    if (chart.options.hasOwnProperty('JCHS') && chart.options.JCHS.hasOwnProperty('tableNotes')) {
      chart_options_note = chart.options.JCHS.tableNotes
    }

    var text = H.pick(user_input_note, chart_options_note, '')

    var rendered_text = chart.renderer
      .text(text)
      .css({ width: '420px' })
      .addClass('JCHS-chart__table-notes--exporting')
      .align({ align: 'right', verticalAlign: 'bottom', x: -10, y: 8 })
      .add()

    var box = rendered_text.getBBox()
    rendered_text.translate(-box.width, -box.height)

  }


  JCHS.numFormat = function (number, decimals) {
    number = +number || 0

    var origDec = (number.toString().split('.')[1] || '').length

    if (decimals === -1) {
      decimals = Math.min(origDec, 20)
    } else if (decimals == null || isNaN(+decimals)) {
      decimals = Math.min(origDec, 2)
    } else {
      decimals = +decimals
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  }


  /* Attach JCHS to Highcharts */

  H.JCHS = JCHS

  H.setOptions(JCHS.standardOptions)

  H.Chart.prototype.callbacks.push(function (chart) {
    if (chart.renderer.forExport) {
      chart.renderer.image(JCHS.logoURL, 0, chart.chartHeight - 50, 170, 55).add()
      H.JCHS.addTableNotes(chart)
    }

    if (chart.options.exporting.hasOwnProperty('JCHS') && chart.options.exporting.JCHS.hasOwnProperty('sheetID')) {
      chart.update({
        exporting: {
          menuItemDefinitions: {
            viewFullDataset: {
              text: 'View full dataset',
              onclick: function () {
                window.open('https://docs.google.com/spreadsheets/d/' + chart.options.exporting.JCHS.sheetID)
              }
            }
          }
        }
      })
    }
  })

  H.addEvent(H.Chart, 'render', function () {
    if (this.options.JCHS && this.options.JCHS.yAxisTitle) {
      H.JCHS.yAxisTitle(this, this.options.JCHS.yAxisTitle, this.options.JCHS.yAxisTitle2)
    }
  })

  // Map: drilldown click handler (mapOptions must be applied by the template via H.setOptions(H.JCHS.mapOptions))
  H.Chart.prototype.callbacks.push(function (chart) {
    if (chart.options.chart.type === 'map') {
      if (chart.options.JCHS && chart.options.JCHS.drilldownFunction) {
        chart.update({
          plotOptions: {
            series: {
              point: {
                events: {
                  click: function (event) {
                    var GEOID = H.pick(event.point.GEOID, event.point.fips, '')
                    chart.options.JCHS.drilldownFunction(event.point.name, GEOID, event.point)
                  }
                }
              }
            }
          }
        })
      }
    }
  })

  // Modal popup behavior for map drilldown
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('JCHS-chart__modal')) {
      e.target.style.display = 'none'
    }
    if (e.target.classList.contains('JCHS-chart__modal__close')) {
      var modal = e.target.closest('.JCHS-chart__modal')
      if (modal) modal.style.display = 'none'
    }
  })

}(Highcharts))
