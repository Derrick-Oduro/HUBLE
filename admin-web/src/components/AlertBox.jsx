import React from 'react'

export default function AlertBox({ kind, message }) {
  return <div className={`alert ${kind}`}>{message}</div>
}