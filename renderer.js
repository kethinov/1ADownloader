let https = require('https')
let path = require('path')
let request = require('request')
let ipcRenderer = require('electron').ipcRenderer
let fs = require('fs')
let template = document.getElementsByTagName('template')[0]
let content = template.innerHTML
let moment = require('moment')
let year
let month
let day
let hour = 1
let segment = 0
let epString
let fileTitle = ''
let epTitle = ''
let scrapes = {}
let thisScrapeCount = 0
let epCount = 0
let maxEpisodes = 30
let notExistsCount = 0
let done = false
let todaysDate = moment().format('YYYY-MM-DD')
let lookback = 0
let req

const {dialog} = require('electron').remote

getSegment()

function getSegment () {
  if (!done) {
    year = moment(todaysDate).subtract(lookback, 'day').format('YY')
    month = moment(todaysDate).subtract(lookback, 'day').format('MM')
    day = moment(todaysDate).subtract(lookback, 'day').format('DD')
    epString = 'a' + hour + year + month + day + (segment ? '-' + segment : '') + '.mp3'

    // check if this file exists
    req = https.request(
      {
        method: 'HEAD',
        host: 'downloads.wamu.org',
        port: 443,
        path: '/mp3/1a/' + year + '/' + month + '/' + epString
      },

      function (res) {
      // if not exists
        if (res.statusCode === 404) {
          notExistsCount++

          // apply segment
          if (segment < 2) {
            segment++
            getSegment()
          } else if (hour === 1) {
            // segment failed, try hour
            hour = 2
            segment = 0
            getSegment()
          } else {
            // segment count got too high and hour is 2... nothing left to check on this day
            lookback++
            if (notExistsCount > 15) {
              // lookback failed too many times
              done = true
            } else {
              hour = 1
              segment = 0
              thisScrapeCount = 0
              getSegment()
            }
          }
        } else {
          // if exists
          // fetch metadata by screen scraping site
          if (!scrapes['20' + year + '-' + month + '-' + day + '/']) {
            https.get('https://the1a.org/shows/20' + year + '-' + month + '-' + day + '/', (res) => {
              const statusCode = res.statusCode

              let error
              if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                                `Status Code: ${statusCode}`)
              }
              if (error) {
                window.alert(error.message)
                // consume response data to free up memory
                res.resume()
                return
              }

              res.setEncoding('utf8')
              let rawData = ''
              res.on('data', (chunk) => {
                rawData += chunk
              })
              res.on('end', () => {
                scrapes['20' + year + '-' + month + '-' + day + '/'] = rawData
                applyMetadata()
              })
            }).on('error', (e) => {
              window.alert(`Got error: ${e.message}`)
            })
          } else {
            applyMetadata()
          }
        }
        function applyMetadata () {
          var scrape = scrapes['20' + year + '-' + month + '-' + day + '/']
          thisScrapeCount++
          scrape = scrape.split('<h2 class="tz-h-lg"><a href="https://the1a.org/shows/20' + year + '-' + month + '-' + day + '/')[thisScrapeCount]

          if (scrape) {
            epTitle = scrape.split('</a>')[0].split('">')[1]
            fileTitle = scrape.split('">')[0]

            document.body.insertAdjacentHTML('beforeEnd', content
              .replace(/{title}/g, year + '-' + month + '-' + day + ' (Hour ' + hour + ') (Segment ' + segment + '): ' + epTitle)
              .replace('{filename}', '1A - ' + year + '-' + month + '-' + day + ' (Hour ' + hour + ') (Segment ' + segment + ') ' + fileTitle + '.mp3')
              .replace('{download}', 'https://downloads.wamu.org/mp3/1a/' + year + '/' + month + '/' + epString))
          }

          notExistsCount = 0
          epCount++
          if (epCount < maxEpisodes) {
            if (hour === 1 && segment === 0) {
              hour = 2
            } else if (hour === 1) {
              if (segment < 2) {
                segment++
              } else {
                hour = 2
                segment = 0
              }
            } else if (hour === 2) {
              if (segment < 2) {
                segment++
              } else {
                hour = 1
                segment = 0
                thisScrapeCount = 0
                lookback++
              }
            }
            getSegment()
          } else {
          // found enough eps
            done = true
          }
        }
      })

    // send request
    req.end()
  }
}

document.getElementById('loading').setAttribute('hidden', 'hidden')

window.addEventListener('click', function (e) {
  let el = e.target
  let req
  let epTitle
  let fileName
  let destination
  let contentLength = 0
  let chunksSoFar = 0
  let percentComplete = 0
  let joshChance
  let spinner

  if (el.nodeName === 'A') {
    if (el.target === '_self') {
      return
    }

    e.preventDefault()
    epTitle = el.getAttribute('data-title')
    fileName = el.getAttribute('data-filename')

    if (el.target === '_blank') {
      // listen to it
      ipcRenderer.send('openListenWindow', {
        epTitle: epTitle,
        href: el.href
      })
    } else {
      // download it
      joshChance = Math.floor(Math.random() * 43711) + 1

      if (joshChance === 1) {
        spinner = document.createElement('img')
        spinner.src = path.join(__dirname, '/images/josh.png')
        spinner.className = 'josh'
      } else {
        spinner = document.createElement('div')
        spinner.className = 'spinner'
      }

      el.style.visibility = 'hidden'
      el.parentNode.insertBefore(spinner, el.parentNode.firstChild)

      req = https.request(
        {
          method: 'HEAD',
          host: 'downloads.wamu.org',
          port: 443,
          path: el.href.replace('https://downloads.wamu.org', '')
        },

        function (res) {
          if (res.statusCode === 404) {
            window.alert('Not posted yet.')
            el.style.visibility = 'visible'
            el.parentNode.removeChild(spinner)
          } else {
            destination = dialog.showOpenDialog({
              properties: ['openDirectory'],
              title: 'Select folder to save episode to...'
            })

            if (destination !== undefined) {
              request.get(el.href)
                .on('error', function (err) {
                  window.alert('Not posted yet.')
                  return err
                })
                .on('response', function (res) {
                  let interval
                  let percentElement = document.createElement('progress')

                  if (res.statusCode === 200) {
                    interval = setInterval(function () {
                      var done
                      percentElement.setAttribute('value', percentComplete)
                      if (percentComplete >= 100) {
                        clearInterval(interval)
                        done = document.createElement('a')
                        done.className = 'topcoat-button'
                        done.href = destination + '/' + fileName
                        done.target = '_blank'
                        done.setAttribute('data-title', epTitle)
                        done.appendChild(document.createTextNode('Listen'))
                        percentElement.parentNode.replaceChild(done, percentElement)
                      }
                    }, 100)

                    contentLength = res.headers['content-length']
                    percentComplete = Math.round((chunksSoFar / contentLength) * 100)
                    percentElement.setAttribute('value', percentComplete)
                    percentElement.setAttribute('max', '100')
                    el.parentNode.replaceChild(percentElement, spinner)
                  } else {
                    return this.emit('error', new Error('Bad status code'))
                  }
                })
                .on('data', function (chunk) {
                  chunksSoFar += chunk.length
                  percentComplete = Math.round((chunksSoFar / contentLength) * 100)
                })
                .pipe(fs.createWriteStream(destination + '/' + fileName))
            } else {
              el.style.visibility = 'visible'
              el.parentNode.removeChild(spinner)
            }
          }
        }
      )
      req.end()
    }
  }
}, true)
