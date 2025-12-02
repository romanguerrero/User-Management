import { createPortal } from "react-dom"

type TooltipContentProps = {
  id: string
  left: number
  top: number
  title?: React.ReactNode
  content?: React.ReactNode
}

export function Tooltip({ id, left, top, title, content }: TooltipContentProps) {
  return createPortal(
    <div
      id={id}
      role="tooltip"
      className="z-50 max-w-xs rounded bg-gray-800 p-3 text-sm text-gray-100 shadow-lg"
      style={{ position: 'fixed', left, top }}
    >
      {title ? <div className="font-semibold mb-1">{title}</div> : null}
      {content ? <div className="whitespace-normal">{content}</div> : null}
    </div>,
    document.body
  )
}
