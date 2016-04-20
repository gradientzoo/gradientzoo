import React from 'react'
import Radium from 'radium'

function formatPeriod(period) {
  switch (period) {
    case 'day':
      return 'today'
    case 'week':
      return 'this week'
    case 'month':
      return 'this month'
    case 'all':
      return ''
  }
  return ''
}

export default Radium((props) => {
  const { downloads } = props
  const period = props.period || 'all'

  const commafied = (downloads[period] || 0).toLocaleString('en')
  const plural = downloads[period] == 1 ? '' : 's'
  const periodFmt = formatPeriod(period)

  return <span>{`${commafied} download${plural} ${periodFmt}`}</span>
})