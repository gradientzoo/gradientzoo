import React from 'react'

export default (props) => {
  const { downloads } = props
  const fmt = (downloads || 0).toLocaleString('en')
  return <span>{fmt + ' download' + (props.downloads == 1 ? '' : 's')}</span>
}