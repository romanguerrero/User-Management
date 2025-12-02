import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Tooltip } from './Tooltip'

type HoverCardProps = {
  title?: React.ReactNode
  content?: React.ReactNode
  children: React.ReactNode
}

const TOOLTIP_CONFIG = {
  WIDTH: 280,
  VIEWPORT_PADDING: 8,
  TRIGGER_GAP: 8,
} as const

function computeTooltipPosition(el: HTMLElement) {  
  const rect = el.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  let left = rect.left + scrollX
  const top = rect.bottom + scrollY + TOOLTIP_CONFIG.TRIGGER_GAP

  const maxLeft = window.innerWidth + scrollX - TOOLTIP_CONFIG.WIDTH - TOOLTIP_CONFIG.VIEWPORT_PADDING
  const minLeft = scrollX + TOOLTIP_CONFIG.VIEWPORT_PADDING

  if (left + TOOLTIP_CONFIG.WIDTH > window.innerWidth + scrollX) {
    left = Math.max(minLeft, maxLeft)
  }

  return { left, top }
}

export function HoverCard({ title, content, children }: HoverCardProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const id = useId()

  const handleShow = useCallback(() => setVisible(true), [])
  const handleHide = useCallback(() => setVisible(false), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (visible && triggerRef.current) {
      setPos(computeTooltipPosition(triggerRef.current))
    }
  }, [visible])

  const tooltip = visible ? (
    <Tooltip
      id={id}
      left={pos.left}
      top={pos.top}
      title={title}
      content={content}
    />
  ) : null

  return (
    <span
      ref={triggerRef}
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      className='inline-flex items-center'
    >
      {children}
      {tooltip}
    </span>
  )
}
