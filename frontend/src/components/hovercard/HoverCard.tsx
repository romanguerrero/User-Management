import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type HoverCardProps = {
  title?: React.ReactNode
  content?: React.ReactNode
  children: React.ReactNode
}

export default function HoverCard({ title, content, children }: HoverCardProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const idRef = useRef(`hovercard-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!visible || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipWidth = 280
    const scrollX = window.scrollX || window.pageXOffset
    const scrollY = window.scrollY || window.pageYOffset
    let left = rect.left + scrollX
    const top = rect.bottom + scrollY + 8
    // keep tooltip inside viewport
    if (left + tooltipWidth > window.innerWidth + scrollX) {
      const l1 = scrollX + 8
      const l2 = window.innerWidth + scrollX - tooltipWidth - 8
      left = Math.max(l1, l2)
    }
    setPos({ left, top })
  }, [visible])

  const tooltip = visible ? (
    createPortal(
      <div
        id={idRef.current}
        role="tooltip"
        className="z-50 max-w-xs rounded bg-gray-800 p-3 text-sm text-gray-100 shadow-lg"
        style={{ position: 'fixed', left: pos.left, top: pos.top }}
      >
        {title ? <div className="font-semibold mb-1">{title}</div> : null}
        {content ? <div className="whitespace-normal">{content}</div> : null}
      </div>,
      document.body
    )
  ) : null

  const setRef = (el: HTMLElement | null) => {
    triggerRef.current = el
  }

  return (
    <span
      ref={setRef}
      tabIndex={0}
      aria-describedby={idRef.current}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      className="inline-flex items-center"
    >
      {children}
      {tooltip}
    </span>
  )
}
